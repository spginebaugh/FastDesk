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

-- Profiles table (extends auth.users)
create table user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email citext not null unique,
    full_name text,
    avatar_url text,
    company text,
    user_type text not null default 'customer' check (user_type in ('agent', 'customer')),
    status user_status not null default 'offline',
    is_active boolean default true,
    external_id text,
    auth_provider text,
    preferences jsonb default '{}'::jsonb,
    metadata jsonb default '{}'::jsonb,
    external_metadata jsonb default '{}'::jsonb,
    last_login_at timestamptz,
    login_count integer default 0,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Teams table
create table organizations (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Team members table
create table organization_members (
    organization_id uuid references organizations(id) on delete cascade,
    profile_id uuid references user_profiles(id) on delete cascade,
    organization_role text not null default 'member',
    created_at timestamptz default now(),
    updated_at timestamptz default now()
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
    organization_id uuid references organizations(id) on delete cascade,
    created_by uuid references user_profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Create function to validate ticket created_by
create or replace function validate_ticket_created_by()
returns trigger as $$
begin
    -- Validate created_by_type and created_by_id combination
    if new.created_by_type = 'customer' then
        if not exists (select 1 from user_profiles where id = new.created_by_id and user_type = 'customer') then
            raise exception 'Invalid customer_id for created_by_id';
        end if;
    elsif new.created_by_type = 'agent' then
        if not exists (select 1 from user_profiles where id = new.created_by_id and user_type = 'agent') then
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
    customer_id uuid not null references user_profiles(id) on delete cascade,
    organization_id uuid references organizations(id) on delete set null,
    status ticket_status not null default 'new',
    priority ticket_priority not null default 'medium',
    source ticket_source not null default 'customer_portal',
    external_reference_id text,
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
    )
);

-- Create trigger for ticket created_by validation
create trigger validate_ticket_created_by_trigger
    before insert or update on tickets
    for each row
    execute function validate_ticket_created_by();

-- Ticket messages table
create table ticket_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    sender_type text not null check (sender_type in ('customer', 'agent', 'system')),
    sender_id uuid,
    content text not null check (length(trim(content)) > 0),
    is_internal boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_valid_sender check (
        (sender_type in ('agent', 'customer') and sender_id is not null) or
        (sender_type = 'system' and sender_id is null)
    )
);

-- Ticket assignments table
create table ticket_assignments (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references tickets(id) on delete cascade,
    agent_id uuid references user_profiles(id) on delete cascade,
    organization_id uuid references organizations(id) on delete cascade,
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
    author_id uuid references user_profiles(id) on delete set null,
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
create index idx_tickets_external_reference_id on tickets(external_reference_id);

create index idx_ticket_messages_ticket_id on ticket_messages(ticket_id);
create index idx_user_profiles_email on user_profiles(email);
create index idx_user_profiles_user_type on user_profiles(user_type);
create index idx_user_profiles_external_id on user_profiles(external_id);

-- Enable Realtime for relevant tables
alter publication supabase_realtime add table organizations;
alter publication supabase_realtime add table organization_members;
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_messages;
alter publication supabase_realtime add table ticket_assignments;
alter publication supabase_realtime add table user_profiles;

-- Create updated_at triggers
create trigger update_profiles_updated_at
    before update on user_profiles
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

-- Create function to handle new user profile creation
create or replace function public.handle_new_user_profile()
returns trigger as $$
begin
    insert into public.user_profiles (
        id,
        email,
        full_name,
        user_type,
        status,
        metadata
    )
    values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'full_name', ''),
        coalesce(new.raw_user_meta_data->>'user_type', 'customer'),
        'offline',
        new.raw_user_meta_data
    );
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user profile creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user_profile();

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

-- Additional indexes for common query patterns
create index idx_tickets_created_at on tickets(created_at);
create index idx_tickets_updated_at on tickets(updated_at);
create index idx_tickets_organization_status on tickets(organization_id, status);
create index idx_ticket_messages_created_at on ticket_messages(created_at);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant select, insert, update on all tables in schema public to authenticated;
grant usage on all sequences in schema public to postgres, anon, authenticated, service_role;
