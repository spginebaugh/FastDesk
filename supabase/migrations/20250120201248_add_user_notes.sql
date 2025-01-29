-- Create function to validate user notes structure
create or replace function validate_user_notes()
returns trigger as $$
declare
    note_record record;
begin
    -- Validate user_notes is an array
    if jsonb_typeof(new.user_notes) != 'array' then
        raise exception 'user_notes must be an array';
    end if;

    -- Validate each note in the array
    for note_record in select value as note from jsonb_array_elements(new.user_notes)
    loop
        if jsonb_typeof(note_record.note->'content') != 'object' then
            raise exception 'Each note must have a content object';
        end if;

        if jsonb_typeof(note_record.note->'content'->'plaintext') != 'string' then
            raise exception 'Each note must have a plaintext field';
        end if;

        if not (note_record.note->>'content_format')::text = any (array['tiptap', 'plain']) then
            raise exception 'content_format must be either tiptap or plain';
        end if;

        if jsonb_typeof(note_record.note->'created_at') != 'string' then
            raise exception 'Each note must have a created_at timestamp';
        end if;

        if jsonb_typeof(note_record.note->'updated_at') != 'string' then
            raise exception 'Each note must have an updated_at timestamp';
        end if;
    end loop;

    return new;
end;
$$ language plpgsql;

-- Create function to extract all plaintext content from notes
create or replace function user_notes_plaintext(notes jsonb)
returns text
language sql
immutable
as $$
    select string_agg(note->'content'->>'plaintext', ' ')
    from jsonb_array_elements(notes) note;
$$;

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
    constraint valid_user_tags check (jsonb_typeof(user_tags) = 'array')
);

-- Create trigger for user notes validation
create trigger validate_user_notes_trigger
    before insert or update on user_notes
    for each row
    execute function validate_user_notes();

-- Create index on plaintext content for faster searching
create index idx_user_notes_plaintext on user_notes using gin (to_tsvector('english', user_notes_plaintext(user_notes)));

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