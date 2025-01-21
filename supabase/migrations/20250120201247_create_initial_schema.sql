-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Create function to execute dynamic SQL
create or replace function exec_sql(sql_query text)
returns void as $$
begin
  execute sql_query;
end;
$$ language plpgsql security definer;

-- Create updated_at column update function
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Create custom types and enums
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type ticket_status as enum ('new', 'open', 'pending', 'resolved', 'closed');
create type user_status as enum ('offline', 'online', 'away', 'transfers_only');
create type ticket_source as enum ('customer_portal', 'agent_portal', 'email', 'api', 'system');
create type channel_type as enum ('email', 'whatsapp', 'sms', 'web', 'telegram');

-- API integrations table
create table api_integrations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    api_key text not null unique,
    status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
    permissions jsonb default '{}'::jsonb,
    rate_limit integer check (rate_limit > 0),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customer organizations table
create table customer_organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    domain text,
    status text not null default 'active',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customers table (moved up before customer_accounts)
create table customers (
    id uuid primary key default uuid_generate_v4(),
    email citext not null unique,
    full_name text,
    company text,
    organization_id uuid references customer_organizations(id),
    type text not null default 'individual' check (type in ('individual', 'business')),
    external_id text,
    auth_provider text,
    preferences jsonb default '{}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    external_metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Profiles table (extends auth.users)
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    role text not null default 'agent',
    status user_status not null default 'offline',
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customer accounts table (extends auth.users for customers)
create table customer_accounts (
    id uuid primary key references auth.users(id),
    customer_id uuid references customers(id),
    status text not null default 'active' check (status in ('active', 'inactive', 'blocked')),
    last_login_at timestamptz,
    login_count integer default 0,
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Teams table
create table teams (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Team members table
create table team_members (
    team_id uuid references teams(id) on delete cascade,
    profile_id uuid references profiles(id) on delete cascade,
    role_in_team text not null default 'member',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Customer organization members
create table customer_organization_members (
    organization_id uuid references customer_organizations(id),
    customer_id uuid references customers(id),
    role text not null default 'member' check (role in ('admin', 'member', 'viewer')),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (organization_id, customer_id)
);

-- Create function to enforce one primary channel per type
create or replace function enforce_one_primary_channel_per_type()
returns trigger as $$
begin
    if new.is_primary then
        -- If there's already a primary channel of this type, prevent the update
        if exists (
            select 1 from customer_channels
            where customer_id = new.customer_id
            and channel_type = new.channel_type
            and is_primary = true
            and id != new.id
        ) then
            raise exception 'Customer already has a primary channel of type %', new.channel_type;
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

-- Customer channels table
create table customer_channels (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references customers(id) on delete cascade,
    channel_type channel_type not null,
    identifier text not null,
    verified boolean default false,
    is_primary boolean default false,
    verification_code text,
    verification_expires_at timestamptz check (
        verification_code is null or 
        (verification_code is not null and verification_expires_at > now())
    ),
    metadata jsonb default '{}'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    unique(channel_type, identifier),
    constraint valid_identifier check (
        case channel_type
            when 'email' then identifier ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
            when 'whatsapp' then identifier ~ '^\+[1-9]\d{1,14}$'
            when 'sms' then identifier ~ '^\+[1-9]\d{1,14}$'
            else true
        end
    )
);

-- Create trigger for one primary channel per type
create trigger enforce_one_primary_channel_per_type_trigger
    before insert or update on customer_channels
    for each row
    execute function enforce_one_primary_channel_per_type();

-- Customer channel preferences
create table customer_channel_preferences (
    customer_id uuid references customers(id),
    channel_id uuid references customer_channels(id),
    notification_enabled boolean default true,
    quiet_hours_start time,
    quiet_hours_end time,
    priority_threshold ticket_priority default 'urgent',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (customer_id, channel_id),
    constraint valid_quiet_hours check (
        (quiet_hours_start is null and quiet_hours_end is null) or
        (quiet_hours_start is not null and quiet_hours_end is not null and
         quiet_hours_start != quiet_hours_end)
    )
);

-- Customer permissions
create table customer_permissions (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid references customers(id),
    resource_type text not null,
    resource_id uuid,
    permission text not null check (permission in ('view', 'edit', 'admin')),
    created_at timestamptz default now(),
    unique(customer_id, resource_type, resource_id)
);

-- Tags table
create table tags (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    color text,
    description text,
    created_at timestamptz default now()
);

-- Templates table for quick responses
create table templates (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    content text not null,
    team_id uuid references teams(id) on delete cascade,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create function to validate ticket created_by
create or replace function validate_ticket_created_by()
returns trigger as $$
begin
    -- Validate created_by_type and created_by_id combination
    if new.created_by_type = 'customer' then
        if not exists (select 1 from customers where id = new.created_by_id) then
            raise exception 'Invalid customer_id for created_by_id';
        end if;
    elsif new.created_by_type = 'agent' then
        if not exists (select 1 from profiles where id = new.created_by_id) then
            raise exception 'Invalid agent_id for created_by_id';
        end if;
    elsif new.created_by_type in ('system', 'api') then
        if new.created_by_id is not null then
            raise exception 'created_by_id must be null for % created tickets', new.created_by_type;
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

-- Tickets table
create table tickets (
    id uuid primary key default uuid_generate_v4(),
    title text not null check (length(trim(title)) > 0),
    customer_id uuid not null references customers(id) on delete cascade,
    team_id uuid references teams(id) on delete set null,
    status ticket_status not null default 'new',
    priority ticket_priority not null default 'medium',
    source ticket_source not null default 'customer_portal',
    external_reference_id text,
    integration_id uuid references api_integrations(id),
    created_by_type text not null check (created_by_type in ('customer', 'agent', 'system', 'api')),
    created_by_id uuid,
    metadata jsonb default '{}'::jsonb,
    integration_metadata jsonb default '{}'::jsonb,
    custom_fields jsonb default '{}'::jsonb,
    due_date timestamptz check (due_date > created_at),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    resolved_at timestamptz check (
        (status != 'resolved' and resolved_at is null) or
        (status = 'resolved' and resolved_at is not null)
    ),
    first_response_at timestamptz check (
        first_response_at is null or first_response_at >= created_at
    ),
    constraint valid_integration check (
        (source != 'api' and integration_id is null and external_reference_id is null) or
        (source = 'api' and integration_id is not null)
    )
);

-- Create trigger for ticket created_by validation
create trigger validate_ticket_created_by_trigger
    before insert or update on tickets
    for each row
    execute function validate_ticket_created_by();

-- Create function to validate ticket message sender
create or replace function validate_ticket_message_sender()
returns trigger as $$
begin
    if new.sender_type = 'agent' then
        if not exists (select 1 from profiles where id = new.sender_id) then
            raise exception 'Invalid agent_id: sender_id must reference a valid profile for agent messages';
        end if;
    elsif new.sender_type = 'customer' then
        if not exists (select 1 from customers where id = new.sender_id) then
            raise exception 'Invalid customer_id: sender_id must reference a valid customer for customer messages';
        end if;
    elsif new.sender_type = 'system' and new.sender_id is not null then
        raise exception 'System messages must not have a sender_id';
    end if;
    return new;
end;
$$ language plpgsql;

-- Ticket messages table
create table ticket_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    sender_type text not null check (sender_type in ('customer', 'agent', 'system')),
    sender_id uuid,
    channel_id uuid references customer_channels(id),
    content text not null check (length(trim(content)) > 0),
    is_internal boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_valid_sender check (
        (sender_type in ('agent', 'customer') and sender_id is not null) or
        (sender_type = 'system' and sender_id is null)
    )
);

-- Create trigger for ticket message sender validation
create trigger validate_ticket_message_sender_trigger
    before insert or update on ticket_messages
    for each row
    execute function validate_ticket_message_sender();

-- Ticket assignments table
create table ticket_assignments (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references tickets(id) on delete cascade,
    agent_id uuid references profiles(id) on delete cascade,
    team_id uuid references teams(id) on delete cascade,
    is_primary boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Ticket tags junction table
create table ticket_tags (
    ticket_id uuid references tickets(id) on delete cascade,
    tag_id uuid references tags(id) on delete cascade,
    created_at timestamptz default now(),
    primary key (ticket_id, tag_id)
);

-- Ticket attachments table
create table ticket_attachments (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    message_id uuid references ticket_messages(id) on delete cascade,
    file_name text not null check (length(trim(file_name)) > 0),
    file_type text,
    file_size integer check (file_size > 0 and file_size <= 100 * 1024 * 1024), -- Max 100MB
    storage_path text not null check (length(trim(storage_path)) > 0),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Knowledge base articles table
create table kb_articles (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    content text not null,
    author_id uuid references profiles(id) on delete set null,
    status text not null default 'draft',
    published_at timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Ticket feedback table
create table ticket_feedback (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create indexes for better query performance
create index idx_tickets_customer_id on tickets(customer_id);
create index idx_tickets_status on tickets(status);
create index idx_tickets_priority on tickets(priority);
create index idx_tickets_source on tickets(source);
create index idx_tickets_integration_id on tickets(integration_id);
create index idx_tickets_external_reference_id on tickets(external_reference_id);

create index idx_ticket_messages_ticket_id on ticket_messages(ticket_id);
create index idx_ticket_messages_channel_id on ticket_messages(channel_id);

create index idx_customer_channels_customer_id on customer_channels(customer_id);
create index idx_customer_channels_identifier on customer_channels(identifier);

create index idx_customer_accounts_customer_id on customer_accounts(customer_id);
create index idx_customers_organization_id on customers(organization_id);
create index idx_customers_external_id on customers(external_id);

create index idx_customer_organization_members_customer_id on customer_organization_members(customer_id);
create index idx_customer_permissions_customer_id on customer_permissions(customer_id);

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_messages;
alter publication supabase_realtime add table ticket_assignments;
alter publication supabase_realtime add table customer_channels;
alter publication supabase_realtime add table customer_accounts;
alter publication supabase_realtime add table customer_organization_members;

-- Create updated_at triggers for new tables
create trigger update_api_integrations_updated_at
    before update on api_integrations
    for each row
    execute function update_updated_at_column();

create trigger update_customer_organizations_updated_at
    before update on customer_organizations
    for each row
    execute function update_updated_at_column();

create trigger update_customer_accounts_updated_at
    before update on customer_accounts
    for each row
    execute function update_updated_at_column();

create trigger update_customer_channels_updated_at
    before update on customer_channels
    for each row
    execute function update_updated_at_column();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant select, insert, update on all tables in schema public to authenticated;
grant usage on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Create function to handle new customer accounts
create or replace function public.handle_new_customer_account()
returns trigger as $$
begin
    -- Create customer record if it doesn't exist
    insert into public.customers (email, full_name)
    values (new.email, new.raw_user_meta_data->>'full_name')
    on conflict (email) do update
    set full_name = EXCLUDED.full_name
    returning id into new.customer_id;

    -- Create customer account
    insert into public.customer_accounts (id, customer_id)
    values (new.id, new.customer_id);

    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new customer accounts
create trigger on_customer_auth_user_created
    after insert on auth.users
    for each row
    when (new.raw_user_meta_data->>'user_type' = 'customer')
    execute function public.handle_new_customer_account();

-- Create updated_at triggers
create trigger update_profiles_updated_at
    before update on profiles
    for each row
    execute function update_updated_at_column();

create trigger update_tickets_updated_at
    before update on tickets
    for each row
    execute function update_updated_at_column();

create trigger update_ticket_messages_updated_at
    before update on ticket_messages
    for each row
    execute function update_updated_at_column();

create trigger update_kb_articles_updated_at
    before update on kb_articles
    for each row
    execute function update_updated_at_column();

create trigger update_ticket_assignments_updated_at
    before update on ticket_assignments
    for each row
    execute function update_updated_at_column();

-- Create function to handle ticket status changes
create or replace function handle_ticket_status_change()
returns trigger as $$
begin
    if new.status != old.status then
        if new.status = 'resolved' then
            new.resolved_at = now();
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger ticket_status_change
    before update on tickets
    for each row
    when (old.status is distinct from new.status)
    execute function handle_ticket_status_change();

-- Create function to track first response time
create or replace function track_first_response()
returns trigger as $$
begin
    if new.sender_type = 'agent' and not exists (
        select 1 from ticket_messages
        where ticket_id = new.ticket_id
        and sender_type = 'agent'
        and created_at < new.created_at
    ) then
        update tickets
        set first_response_at = new.created_at
        where id = new.ticket_id
        and first_response_at is null;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger track_ticket_first_response
    after insert on ticket_messages
    execute function track_first_response();

-- Additional indexes for existing tables
create index idx_ticket_tags_ticket_id on ticket_tags(ticket_id);
create index idx_ticket_tags_tag_id on ticket_tags(tag_id);
create index idx_ticket_assignments_ticket_id on ticket_assignments(ticket_id);
create index idx_ticket_assignments_agent_id on ticket_assignments(agent_id);
create index idx_ticket_assignments_team_id on ticket_assignments(team_id);

-- Grant permissions for auth schema
grant usage on schema auth to postgres, service_role;
grant all privileges on all tables in schema auth to postgres, service_role;
grant all privileges on auth.users to postgres, service_role;

-- Create function to automatically create profile for new agent users
create or replace function public.handle_new_agent()
returns trigger as $$
declare
    v_customer_id uuid;
    v_ticket_id uuid;
begin
    -- Only proceed if this is an agent user
    if (new.raw_user_meta_data->>'user_type' != 'agent') then
        return new;
    end if;

    -- Create profile for new agent
    insert into public.profiles (id, role)
    values (new.id, 'agent')
    on conflict (id) do nothing;

    -- Create or get the sample customer
    insert into public.customers (email, full_name)
    values ('customer@example.com', 'The Customer')
    on conflict (email) do update set full_name = 'The Customer'
    returning id into v_customer_id;

    -- Create the sample ticket
    insert into public.tickets (
        title,
        customer_id,
        status,
        priority,
        source,
        created_by_type
    )
    values (
        'SAMPLE TICKET: Meet the ticket',
        v_customer_id,
        'new',
        'medium',
        'system',
        'system'
    )
    returning id into v_ticket_id;

    -- Create ticket assignment for the new user
    insert into public.ticket_assignments (
        ticket_id,
        agent_id,
        is_primary
    )
    values (
        v_ticket_id,
        new.id,
        true
    );

    -- Add the initial message
    insert into public.ticket_messages (
        ticket_id,
        sender_type,
        customer_sender_id,
        content
    )
    values (
        v_ticket_id,
        'customer',
        v_customer_id,
        E'Hi there,\n\nI''m sending an email because I''m having a problem setting up your new product. Can you help me troubleshoot?\n\nThanks,\nThe Customer'
    );

    return new;
exception
    when others then
        raise log 'Error in handle_new_agent: %', SQLERRM;
        return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger to handle new agent creation
create trigger on_agent_auth_user_created
    after insert on auth.users
    for each row
    when (new.raw_user_meta_data->>'user_type' = 'agent')
    execute function public.handle_new_agent();

-- Additional indexes for common query patterns
create index idx_tickets_created_at on tickets(created_at);
create index idx_tickets_updated_at on tickets(updated_at);
create index idx_tickets_team_status on tickets(team_id, status);
create index idx_tickets_customer_status on tickets(customer_id, status);

create index idx_ticket_messages_created_at on ticket_messages(created_at);
create index idx_ticket_messages_channel on ticket_messages(channel_id, created_at);

create index idx_customer_channels_type on customer_channels(channel_type);
create index idx_customer_channels_verified on customer_channels(verified);

create index idx_kb_articles_status_published on kb_articles(status, published_at);

-- Create trigger function for new user profile creation
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    'agent'  -- Set default role to agent for all new signups
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user profile creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user_profile();
