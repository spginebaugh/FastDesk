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
create type ticket_source as enum ('customer_portal', 'worker_portal', 'email', 'api', 'system');
create type channel_type as enum ('email', 'whatsapp', 'sms', 'web', 'telegram');
create type organization_role as enum ('admin', 'member', 'customer');

-- Profiles table (extends auth.users)
create table user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email citext not null unique,
    full_name text,
    avatar_url text,
    company text,
    user_type text not null default 'customer' check (user_type in ('worker', 'customer')),
    user_status user_status not null default 'offline',
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
    organization_role organization_role not null default 'customer',
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    primary key (organization_id, profile_id)
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
    -- Only validate that the created_by_id matches the user_type in user_profiles
    if new.created_by_type in ('customer', 'worker') then
        if not exists (
            select 1 
            from user_profiles 
            where id = new.created_by_id 
            and user_type = new.created_by_type
        ) then
            raise exception 'created_by_id does not match the specified created_by_type';
        end if;
    elsif new.created_by_type in ('system', 'api') then
        if new.created_by_id is not null then
            raise exception 'created_by_id must be null for % created tickets', new.created_by_type;
        end if;
    end if;

    -- Ensure the user_id exists in user_profiles
    if not exists (
        select 1 
        from user_profiles 
        where id = new.user_id
    ) then
        raise exception 'Invalid user_id';
    end if;

    return new;
end;
$$ language plpgsql;

-- Tickets table
create table tickets (
    id uuid primary key default uuid_generate_v4(),
    title text not null check (length(trim(title)) > 0),
    user_id uuid not null references user_profiles(id) on delete cascade,
    organization_id uuid references organizations(id) on delete set null,
    ticket_status ticket_status not null default 'new',
    ticket_priority ticket_priority not null default 'medium',
    ticket_source ticket_source not null default 'customer_portal',
    external_reference_id text,
    created_by_type text not null check (created_by_type in ('customer', 'worker', 'system', 'api')),
    created_by_id uuid,
    metadata jsonb default '{}'::jsonb,
    integration_metadata jsonb default '{}'::jsonb,
    custom_fields jsonb default '{}'::jsonb,
    due_date timestamptz check (due_date > created_at),
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    resolved_at timestamptz check (
        (ticket_status != 'resolved' and resolved_at is null) or
        (ticket_status = 'resolved' and resolved_at is not null)
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

-- Create function to validate ticket message content
create or replace function validate_ticket_message_content()
returns trigger as $$
declare
    content_type text;
begin
    -- Validate content is an object
    if jsonb_typeof(new.content) != 'object' then
        raise exception 'Message content must be a JSON object, got %', jsonb_typeof(new.content);
    end if;

    -- Validate plaintext content exists and is non-empty
    if jsonb_typeof(new.content->'plaintext') != 'string' then
        raise exception 'Message content must have a plaintext field of type string, got %', 
            coalesce(jsonb_typeof(new.content->'plaintext'), 'null');
    end if;

    if length(trim((new.content->>'plaintext')::text)) = 0 then
        raise exception 'Message plaintext content cannot be empty';
    end if;

    -- Validate content has required fields for rich text
    if new.content_format = 'tiptap' then
        -- Validate type field
        if jsonb_typeof(new.content->'type') != 'string' then
            raise exception 'TipTap content must have type field of type string, got %',
                coalesce(jsonb_typeof(new.content->'type'), 'null');
        end if;

        -- Get and validate content type
        content_type := new.content->>'type';
        if content_type != 'doc' then
            raise exception 'TipTap content type must be "doc", got %', content_type;
        end if;

        -- Validate content array
        if jsonb_typeof(new.content->'content') != 'array' then
            raise exception 'TipTap content must have content field of type array, got %',
                coalesce(jsonb_typeof(new.content->'content'), 'null');
        end if;
    end if;

    return new;
end;
$$ language plpgsql;

-- Create index function for plaintext search
create or replace function ticket_message_plaintext(content jsonb)
returns text
language sql
immutable
as $$
    select content->>'plaintext';
$$;

-- Ticket messages table
create table ticket_messages (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid not null references tickets(id) on delete cascade,
    sender_type text not null check (sender_type in ('customer', 'worker', 'system')),
    sender_id uuid,
    content jsonb not null,
    content_format text not null default 'tiptap' check (content_format in ('tiptap', 'plain')),
    is_internal boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint check_valid_sender check (
        (sender_type in ('worker', 'customer') and sender_id is not null) or
        (sender_type = 'system' and sender_id is null)
    )
);

-- Create trigger for ticket message content validation
create trigger validate_ticket_message_content_trigger
    before insert or update on ticket_messages
    for each row
    execute function validate_ticket_message_content();

-- Create index on plaintext content for faster searching
create index idx_ticket_messages_plaintext on ticket_messages using gin (to_tsvector('english', ticket_message_plaintext(content)));

-- Ticket assignments table
create table ticket_assignments (
    id uuid primary key default uuid_generate_v4(),
    ticket_id uuid references tickets(id) on delete cascade,
    worker_id uuid references user_profiles(id) on delete cascade,
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
    kb_status text not null default 'draft',
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
create index idx_tickets_user_id on tickets(user_id);
create index idx_tickets_status on tickets(ticket_status);
create index idx_tickets_priority on tickets(ticket_priority);
create index idx_tickets_source on tickets(ticket_source);
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
        user_status,
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
    if new.ticket_status != old.ticket_status then
        if new.ticket_status = 'resolved' then
            new.resolved_at = now();
        end if;
    end if;
    return new;
end;
$$ language plpgsql;

create trigger ticket_status_change
    before update on tickets
    for each row
    when (old.ticket_status is distinct from new.ticket_status)
    execute function handle_ticket_status_change();

-- Create function to track first response time
create or replace function track_first_response()
returns trigger as $$
begin
    if new.sender_type = 'worker' and not exists (
        select 1 from ticket_messages
        where ticket_id = new.ticket_id
        and sender_type = 'worker'
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
create index idx_tickets_organization_status on tickets(organization_id, ticket_status);
create index idx_ticket_messages_created_at on ticket_messages(created_at);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant select, insert, update on all tables in schema public to authenticated;
grant usage on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Grant auth schema permissions
grant usage on schema auth to postgres, anon, authenticated, service_role;
grant select on auth.users to authenticated;

create policy "Users can only view their own auth.users record"
    on auth.users for select
    using (auth.uid() = id);

-- Enable Row Level Security on all tables
alter table user_profiles enable row level security;
alter table organizations enable row level security;
alter table organization_members enable row level security;
alter table tags enable row level security;
alter table templates enable row level security;
alter table tickets enable row level security;
alter table ticket_messages enable row level security;
alter table ticket_assignments enable row level security;
alter table ticket_tags enable row level security;
alter table ticket_attachments enable row level security;
alter table kb_articles enable row level security;
alter table ticket_feedback enable row level security;

-- User Profiles policies
drop policy if exists "Users can view their own profile or profiles in their admin organizations" on user_profiles;
drop policy if exists "Users can update their own profile" on user_profiles;

-- Simplified policy to allow viewing basic profile data
create policy "Users can view all profiles"
    on user_profiles for select
    using (true);

create policy "Users can update their own profile"
    on user_profiles for update
    using (id = auth.uid());

-- Organization policies
drop policy if exists "Organization members can view their organizations" on organizations;
drop policy if exists "Only organization admins can update organization details" on organizations;
drop policy if exists "Workers can create organizations" on organizations;

create policy "Users can view organizations they are members of"
    on organizations for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = organizations.id
            and organization_members.profile_id = auth.uid()
        )
        or exists (
            select 1 from user_profiles
            where id = auth.uid()
            and user_type = 'worker'
        )
    );

create policy "Only organization admins can update organization details"
    on organizations for update
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = organizations.id
            and organization_members.profile_id = auth.uid()
            and organization_members.organization_role = 'admin'
        )
    );

create policy "Workers can create organizations"
    on organizations for insert
    with check (
        exists (
            select 1 from user_profiles
            where id = auth.uid()
            and user_type = 'worker'
        )
    );

-- Create a security definer function to check organization membership
create or replace function check_organization_membership(user_id uuid, org_id uuid)
returns boolean
security definer
set search_path = public
stable
language plpgsql
as $$
begin
  return exists (
    select 1
    from organization_members
    where profile_id = user_id
    and organization_id = org_id
  );
end;
$$;

-- Create a security definer function to check organization admin status
create or replace function check_organization_admin(user_id uuid, org_id uuid)
returns boolean
security definer
set search_path = public
stable
language plpgsql
as $$
begin
  return exists (
    select 1
    from organization_members
    where profile_id = user_id
    and organization_id = org_id
    and organization_role = 'admin'
  );
end;
$$;

-- Organization members policies
drop policy if exists "Organization members can view other members in their organization" on organization_members;
drop policy if exists "Organization admins can insert members" on organization_members;
drop policy if exists "Organization admins can update members" on organization_members;
drop policy if exists "Organization admins can delete members" on organization_members;

create policy "Organization members can view other members in their organization"
    on organization_members for select
    using (check_organization_membership(auth.uid(), organization_id));

create policy "Organization admins can insert members"
    on organization_members for insert
    with check (
        check_organization_admin(auth.uid(), organization_id)
        or (
            -- Allow workers to add themselves as admin when creating a new organization
            exists (
                select 1 from user_profiles
                where id = auth.uid()
                and user_type = 'worker'
                and auth.uid() = profile_id  -- Only allowing self-insertion
                and organization_role = 'admin'  -- Must be admin role
            )
        )
    );

create policy "Organization admins can update members"
    on organization_members for update
    using (check_organization_admin(auth.uid(), organization_id));

create policy "Organization admins can delete members"
    on organization_members for delete
    using (check_organization_admin(auth.uid(), organization_id));

-- Tickets policies
drop policy if exists "Users can view tickets they created or are assigned to" on tickets;
drop policy if exists "Users can create tickets" on tickets;
drop policy if exists "Workers can update tickets they are assigned to" on tickets;

create policy "Organization members can view all organization tickets"
    on tickets for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = tickets.organization_id
            and organization_members.profile_id = auth.uid()
        )
        or (
            -- Allow workers to view all tickets (including unassigned ones)
            exists (
                select 1 from user_profiles
                where user_profiles.id = auth.uid()
                and user_profiles.user_type = 'worker'
            )
        )
    );

create policy "Organization members and workers can create tickets"
    on tickets for insert
    with check (
        (
            -- Allow organization members to create tickets for their organization
            organization_id is not null
            and exists (
                select 1 from organization_members
                where organization_members.organization_id = tickets.organization_id
                and organization_members.profile_id = auth.uid()
            )
        )
        or
        (
            -- Allow workers to create tickets without an organization
            exists (
                select 1 from user_profiles
                where user_profiles.id = auth.uid()
                and user_profiles.user_type = 'worker'
            )
        )
    );

create policy "Organization members can update tickets"
    on tickets for update
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = tickets.organization_id
            and organization_members.profile_id = auth.uid()
        )
        or (
            -- Allow workers to update any ticket
            exists (
                select 1 from user_profiles
                where user_profiles.id = auth.uid()
                and user_profiles.user_type = 'worker'
            )
        )
    );

-- Ticket messages policies
drop policy if exists "Users can view messages for tickets they have access to" on ticket_messages;
drop policy if exists "Users can create messages for their tickets" on ticket_messages;

create policy "Organization members can view all messages"
    on ticket_messages for select
    using (
        exists (
            select 1 from tickets t
            join organization_members om on om.organization_id = t.organization_id
            where t.id = ticket_messages.ticket_id
            and om.profile_id = auth.uid()
        )
    );

create policy "Organization members can create messages"
    on ticket_messages for insert
    with check (
        exists (
            select 1 from tickets t
            join organization_members om on om.organization_id = t.organization_id
            where t.id = ticket_messages.ticket_id
            and om.profile_id = auth.uid()
        )
    );

-- Ticket assignments policies
create policy "Organization members can view and manage assignments"
    on ticket_assignments for all
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = ticket_assignments.organization_id
            and organization_members.profile_id = auth.uid()
            and organization_members.organization_role in ('admin', 'member')
        )
    );

-- Templates policies
create policy "Organization members can view templates"
    on templates for select
    using (
        exists (
            select 1 from organization_members
            where organization_members.organization_id = templates.organization_id
            and organization_members.profile_id = auth.uid()
        )
    );

create policy "Only workers can manage templates"
    on templates for all
    using (
        exists (
            select 1 from organization_members om
            join user_profiles up on up.id = om.profile_id
            where om.organization_id = templates.organization_id
            and om.profile_id = auth.uid()
            and up.user_type = 'worker'
            and om.organization_role in ('admin', 'member')
        )
    );

-- Knowledge base articles policies
create policy "Published articles are visible to all authenticated users"
    on kb_articles for select
    using (kb_status = 'published' or author_id = auth.uid());

create policy "Only workers can manage articles"
    on kb_articles for all
    using (
        exists (
            select 1 from user_profiles
            where user_profiles.id = auth.uid()
            and user_profiles.user_type = 'worker'
        )
    );

-- Ticket feedback policies
create policy "Users can view feedback for their tickets"
    on ticket_feedback for select
    using (
        exists (
            select 1 from tickets
            where tickets.id = ticket_feedback.ticket_id
            and (
                tickets.user_id = auth.uid()
                or exists (
                    select 1 from ticket_assignments
                    where ticket_assignments.ticket_id = tickets.id
                    and ticket_assignments.worker_id = auth.uid()
                )
                or exists (
                    select 1 from organization_members
                    where organization_members.organization_id = tickets.organization_id
                    and organization_members.profile_id = auth.uid()
                    and organization_members.organization_role in ('admin', 'member')
                )
            )
        )
    );

create policy "Users can create feedback for their tickets"
    on ticket_feedback for insert
    with check (
        exists (
            select 1 from tickets
            where tickets.id = ticket_feedback.ticket_id
            and tickets.user_id = auth.uid()
        )
    );

-- Tags policies
create policy "Tags are readable by all authenticated users"
    on tags for select
    to authenticated
    using (true);

create policy "Only workers can manage tags"
    on tags for all
    using (
        exists (
            select 1 from user_profiles
            where user_profiles.id = auth.uid()
            and user_profiles.user_type = 'worker'
        )
    );

-- Ticket tags policies
create policy "Users can view tags for tickets they have access to"
    on ticket_tags for select
    using (
        exists (
            select 1 from tickets
            where tickets.id = ticket_tags.ticket_id
            and (
                tickets.user_id = auth.uid()
                or exists (
                    select 1 from ticket_assignments
                    where ticket_assignments.ticket_id = tickets.id
                    and ticket_assignments.worker_id = auth.uid()
                )
                or exists (
                    select 1 from organization_members
                    where organization_members.organization_id = tickets.organization_id
                    and organization_members.profile_id = auth.uid()
                    and organization_members.organization_role in ('admin', 'member')
                )
            )
        )
    );

create policy "Only workers can manage ticket tags"
    on ticket_tags for all
    using (
        exists (
            select 1 from user_profiles
            where user_profiles.id = auth.uid()
            and user_profiles.user_type = 'worker'
        )
    );

-- Ticket attachments policies
create policy "Users can view attachments for tickets they have access to"
    on ticket_attachments for select
    using (
        exists (
            select 1 from tickets
            where tickets.id = ticket_attachments.ticket_id
            and (
                tickets.user_id = auth.uid()
                or exists (
                    select 1 from ticket_assignments
                    where ticket_assignments.ticket_id = tickets.id
                    and ticket_assignments.worker_id = auth.uid()
                )
                or exists (
                    select 1 from organization_members
                    where organization_members.organization_id = tickets.organization_id
                    and organization_members.profile_id = auth.uid()
                    and organization_members.organization_role in ('admin', 'member')
                )
            )
        )
    );

create policy "Users can create attachments for their tickets"
    on ticket_attachments for insert
    with check (
        exists (
            select 1 from tickets
            where tickets.id = ticket_attachments.ticket_id
            and (
                tickets.user_id = auth.uid()
                or exists (
                    select 1 from ticket_assignments
                    where ticket_assignments.ticket_id = tickets.id
                    and ticket_assignments.worker_id = auth.uid()
                )
                or exists (
                    select 1 from organization_members
                    where organization_members.organization_id = tickets.organization_id
                    and organization_members.profile_id = auth.uid()
                    and organization_members.organization_role in ('admin', 'member')
                )
            )
        )
    );

-- Create function to validate organization member roles
create or replace function validate_organization_member_role()
returns trigger as $$
begin
    -- Get the user type from user_profiles
    declare
        user_type text;
    begin
        select up.user_type into user_type
        from user_profiles up
        where up.id = new.profile_id;

        if user_type = 'customer' and new.organization_role != 'customer' then
            raise exception 'Customers can only have the organization_role of "customer"';
        end if;

        if user_type = 'worker' and new.organization_role not in ('admin', 'member') then
            raise exception 'Workers can only have organization_role of "admin" or "member"';
        end if;

        return new;
    end;
end;
$$ language plpgsql;

-- Create trigger for organization member role validation
create trigger validate_organization_member_role_trigger
    before insert or update on organization_members
    for each row
    execute function validate_organization_member_role();

-- Create index for organization members lookup
create index idx_organization_members_profile on organization_members(profile_id);
create index idx_organization_members_role on organization_members(organization_role);
