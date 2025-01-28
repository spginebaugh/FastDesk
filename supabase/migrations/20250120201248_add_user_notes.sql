-- Create user notes table
create table user_notes (
    id uuid primary key default uuid_generate_v4(),
    organization_id uuid not null references organizations(id) on delete cascade,
    user_id uuid not null references user_profiles(id) on delete cascade,
    user_tags jsonb default '[]'::jsonb,
    user_notes jsonb default '[]'::jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    created_by uuid references user_profiles(id) on delete set null,
    updated_by uuid references user_profiles(id) on delete set null,
    constraint valid_user_tags check (jsonb_typeof(user_tags) = 'array'),
    constraint valid_user_notes check (jsonb_typeof(user_notes) = 'array')
);

-- Create indexes for better query performance
create index idx_user_notes_organization on user_notes(organization_id);
create index idx_user_notes_user on user_notes(user_id);
create index idx_user_notes_created_by on user_notes(created_by);

-- Add updated_at trigger
create trigger update_user_notes_updated_at
    before update on user_notes
    for each row
    execute function update_updated_at_column();

-- Enable RLS
alter table user_notes enable row level security;

-- Create policies for user notes
create policy "Workers can view user notes in their organization"
    on user_notes for select
    using (
        exists (
            select 1 
            from organization_members om
            join user_profiles up on up.id = om.profile_id
            where om.organization_id = user_notes.organization_id
            and om.profile_id = auth.uid()
            and up.user_type = 'worker'
            and om.organization_role in ('admin', 'member')
        )
    );

create policy "Workers can create user notes in their organization"
    on user_notes for insert
    with check (
        exists (
            select 1 
            from organization_members om
            join user_profiles up on up.id = om.profile_id
            where om.organization_id = user_notes.organization_id
            and om.profile_id = auth.uid()
            and up.user_type = 'worker'
            and om.organization_role in ('admin', 'member')
        )
    );

create policy "Workers can update user notes in their organization"
    on user_notes for update
    using (
        exists (
            select 1 
            from organization_members om
            join user_profiles up on up.id = om.profile_id
            where om.organization_id = user_notes.organization_id
            and om.profile_id = auth.uid()
            and up.user_type = 'worker'
            and om.organization_role in ('admin', 'member')
        )
    );

create policy "Workers can delete user notes in their organization"
    on user_notes for delete
    using (
        exists (
            select 1 
            from organization_members om
            join user_profiles up on up.id = om.profile_id
            where om.organization_id = user_notes.organization_id
            and om.profile_id = auth.uid()
            and up.user_type = 'worker'
            and om.organization_role in ('admin', 'member')
        )
    );

-- Add unique constraint to prevent multiple notes for same user in same organization
create unique index idx_unique_user_org_notes 
    on user_notes(organization_id, user_id);

-- Enable realtime
alter publication supabase_realtime add table user_notes;

-- Grant permissions
grant all privileges on table user_notes to postgres, service_role;
grant select, insert, update, delete on table user_notes to authenticated; 