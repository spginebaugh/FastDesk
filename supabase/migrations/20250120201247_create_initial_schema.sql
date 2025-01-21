-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "citext";

-- Create custom types and enums
create type ticket_priority as enum ('low', 'medium', 'high', 'urgent');
create type ticket_status as enum ('new', 'open', 'pending', 'resolved', 'closed');
create type user_status as enum ('offline', 'online', 'away', 'transfers_only');

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

-- Customers table
create table customers (
    id uuid primary key default uuid_generate_v4(),
    email citext not null unique,
    full_name text,
    company text,
    metadata jsonb default '{}'::jsonb,
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
    team_id uuid references teams(id) on delete cascade,
    created_by uuid references profiles(id) on delete set null,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Tickets table
create table tickets (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    customer_id uuid not null references customers(id) on delete cascade,
    team_id uuid references teams(id) on delete set null,
    status ticket_status not null default 'new',
    priority ticket_priority not null default 'medium',
    metadata jsonb default '{}'::jsonb,
    custom_fields jsonb default '{}'::jsonb,
    due_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    resolved_at timestamptz,
    first_response_at timestamptz
);

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

-- Ticket messages table
create table ticket_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    sender_type text not null check (sender_type in ('customer', 'agent', 'system')),
    agent_sender_id uuid references profiles(id) on delete set null,
    customer_sender_id uuid references customers(id) on delete set null,
    content text not null,
    is_internal boolean default false,
    parent_message_id uuid references ticket_messages(id) on delete set null,
    thread_id uuid,
    thread_position integer,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_sender_type check (
        (sender_type = 'agent' and agent_sender_id is not null and customer_sender_id is null) or
        (sender_type = 'customer' and customer_sender_id is not null and agent_sender_id is null) or
        (sender_type = 'system' and agent_sender_id is null and customer_sender_id is null)
    )
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
    file_name text not null,
    file_type text,
    file_size integer,
    storage_path text not null,
    created_at timestamptz default now()
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
    rating integer check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamptz default now()
);

-- Create indexes for better query performance
create index idx_tickets_customer_id on tickets(customer_id);
create index idx_tickets_status on tickets(status);
create index idx_tickets_priority on tickets(priority);
create index idx_ticket_messages_ticket_id on ticket_messages(ticket_id);
create index idx_ticket_messages_parent_id on ticket_messages(parent_message_id);
create index idx_ticket_messages_thread_id on ticket_messages(thread_id);
create index idx_ticket_tags_ticket_id on ticket_tags(ticket_id);
create index idx_ticket_tags_tag_id on ticket_tags(tag_id);
create index idx_ticket_assignments_ticket_id on ticket_assignments(ticket_id);
create index idx_ticket_assignments_agent_id on ticket_assignments(agent_id);
create index idx_ticket_assignments_team_id on ticket_assignments(team_id);

-- Enable Realtime for tables that need real-time updates
alter publication supabase_realtime add table teams;
alter publication supabase_realtime add table team_members;
alter publication supabase_realtime add table tickets;
alter publication supabase_realtime add table ticket_messages;
alter publication supabase_realtime add table ticket_tags;
alter publication supabase_realtime add table ticket_attachments;
alter publication supabase_realtime add table ticket_feedback;
alter publication supabase_realtime add table ticket_assignments;

-- Create updated_at triggers
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

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
    for each row
    execute function track_first_response();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all functions in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Grant permissions for auth schema
grant usage on schema auth to postgres, service_role;
grant all privileges on all tables in schema auth to postgres, service_role;
grant all privileges on auth.users to postgres, service_role;

-- Create function to automatically create profile for new auth users
create or replace function public.handle_new_user()
returns trigger as $$
declare
    v_customer_id uuid;
    v_ticket_id uuid;
begin
    -- Create profile for new user
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
        priority
    )
    values (
        'SAMPLE TICKET: Meet the ticket',
        v_customer_id,
        'new',
        'medium'
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
        raise log 'Error in handle_new_user: %', SQLERRM;
        return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Create trigger to handle new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();
