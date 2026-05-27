-- ============================================================
-- ClickBIM – Full Database Schema
-- Migration: 001_schema.sql
-- ============================================================

-- ----------------------------------------------------------------
-- EXTENSIONS
-- ----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- HELPER: is_workspace_member
-- ----------------------------------------------------------------
create or replace function is_workspace_member(p_workspace_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from   workspace_members
    where  workspace_id = p_workspace_id
    and    user_id      = p_user_id
  );
$$;

-- ----------------------------------------------------------------
-- TABLE: profiles
-- ----------------------------------------------------------------
create table if not exists profiles (
  id          uuid        primary key references auth.users (id) on delete cascade,
  email       text        not null,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: workspaces
-- ----------------------------------------------------------------
create table if not exists workspaces (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  slug        text        not null unique,
  logo_url    text,
  owner_id    uuid        not null references profiles (id) on delete restrict,
  color       text        not null default '#F97316',
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: workspace_members
-- ----------------------------------------------------------------
create table if not exists workspace_members (
  id           uuid        primary key default gen_random_uuid(),
  workspace_id uuid        not null references workspaces (id) on delete cascade,
  user_id      uuid        not null references profiles   (id) on delete cascade,
  role         text        not null default 'member'
                           check (role in ('owner', 'admin', 'member', 'viewer')),
  joined_at    timestamptz not null default now(),
  unique (workspace_id, user_id)
);

-- ----------------------------------------------------------------
-- TABLE: spaces
-- ----------------------------------------------------------------
create table if not exists spaces (
  id           uuid        primary key default gen_random_uuid(),
  workspace_id uuid        not null references workspaces (id) on delete cascade,
  name         text        not null,
  color        text,
  icon         text,
  is_private   boolean     not null default false,
  position     integer     not null default 0,
  created_by   uuid        references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: projects
-- ----------------------------------------------------------------
create table if not exists projects (
  id          uuid        primary key default gen_random_uuid(),
  space_id    uuid        not null references spaces   (id) on delete cascade,
  name        text        not null,
  description text,
  color       text,
  icon        text,
  status      text        not null default 'active',
  position    integer     not null default 0,
  due_date    date,
  created_by  uuid        references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: lists
-- ----------------------------------------------------------------
create table if not exists lists (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references projects (id) on delete cascade,
  name        text        not null,
  color       text,
  position    integer     not null default 0,
  is_archived boolean     not null default false,
  created_by  uuid        references profiles (id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: task_statuses
-- ----------------------------------------------------------------
create table if not exists task_statuses (
  id        uuid    primary key default gen_random_uuid(),
  list_id   uuid    not null references lists (id) on delete cascade,
  name      text    not null,
  color     text    not null,
  position  integer not null default 0,
  is_closed boolean not null default false
);

-- ----------------------------------------------------------------
-- TABLE: tasks
-- ----------------------------------------------------------------
create table if not exists tasks (
  id             uuid        primary key default gen_random_uuid(),
  list_id        uuid        not null references lists        (id) on delete cascade,
  parent_task_id uuid        references tasks        (id) on delete set null,
  status_id      uuid        references task_statuses (id) on delete set null,
  title          text        not null,
  description    jsonb,
  priority       text        not null default 'normal'
                             check (priority in ('urgent', 'high', 'normal', 'low', 'none')),
  due_date       timestamptz,
  start_date     timestamptz,
  time_estimate  integer,                     -- stored in minutes
  position       float8      not null default 0,
  is_archived    boolean     not null default false,
  created_by     uuid        references profiles (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: task_assignees
-- ----------------------------------------------------------------
create table if not exists task_assignees (
  task_id     uuid        not null references tasks    (id) on delete cascade,
  user_id     uuid        not null references profiles (id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

-- ----------------------------------------------------------------
-- TABLE: tags
-- ----------------------------------------------------------------
create table if not exists tags (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces (id) on delete cascade,
  name         text not null,
  color        text,
  unique (workspace_id, name)
);

-- ----------------------------------------------------------------
-- TABLE: task_tags
-- ----------------------------------------------------------------
create table if not exists task_tags (
  task_id uuid not null references tasks (id) on delete cascade,
  tag_id  uuid not null references tags  (id) on delete cascade,
  primary key (task_id, tag_id)
);

-- ----------------------------------------------------------------
-- TABLE: comments
-- ----------------------------------------------------------------
create table if not exists comments (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references tasks    (id) on delete cascade,
  author_id  uuid        references profiles (id) on delete set null,
  content    jsonb       not null,
  is_edited  boolean     not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: attachments
-- ----------------------------------------------------------------
create table if not exists attachments (
  id           uuid        primary key default gen_random_uuid(),
  task_id      uuid        not null references tasks    (id) on delete cascade,
  uploaded_by  uuid        references profiles (id) on delete set null,
  file_name    text        not null,
  file_size    bigint,
  mime_type    text,
  storage_path text        not null,
  created_at   timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: activity_log
-- ----------------------------------------------------------------
create table if not exists activity_log (
  id         uuid        primary key default gen_random_uuid(),
  task_id    uuid        not null references tasks    (id) on delete cascade,
  actor_id   uuid        references profiles (id) on delete set null,
  action     text        not null,
  old_value  jsonb,
  new_value  jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------
-- TABLE: notifications
-- ----------------------------------------------------------------
create table if not exists notifications (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references profiles (id) on delete cascade,
  type       text        not null,
  payload    jsonb,
  is_read    boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_workspace_members_workspace on workspace_members (workspace_id);
create index if not exists idx_workspace_members_user      on workspace_members (user_id);
create index if not exists idx_spaces_workspace            on spaces            (workspace_id);
create index if not exists idx_projects_space              on projects          (space_id);
create index if not exists idx_lists_project               on lists             (project_id);
create index if not exists idx_task_statuses_list          on task_statuses     (list_id);
create index if not exists idx_tasks_list                  on tasks             (list_id);
create index if not exists idx_tasks_status                on tasks             (status_id);
create index if not exists idx_tasks_parent                on tasks             (parent_task_id);
create index if not exists idx_task_assignees_user         on task_assignees    (user_id);
create index if not exists idx_comments_task               on comments          (task_id);
create index if not exists idx_activity_log_task           on activity_log      (task_id);
create index if not exists idx_notifications_user          on notifications     (user_id);
create index if not exists idx_notifications_unread        on notifications     (user_id) where not is_read;

-- ================================================================
-- TRIGGERS – utility functions
-- ================================================================

-- ----------------------------------------------------------------
-- auto-update updated_at
-- ----------------------------------------------------------------
create or replace function fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace trigger trg_tasks_updated_at
  before update on tasks
  for each row execute function fn_set_updated_at();

create or replace trigger trg_comments_updated_at
  before update on comments
  for each row execute function fn_set_updated_at();

-- ----------------------------------------------------------------
-- auto-create profile when auth.users row is inserted
-- ----------------------------------------------------------------
create or replace function fn_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function fn_handle_new_user();

-- ----------------------------------------------------------------
-- default task_statuses when a list is created
-- ----------------------------------------------------------------
create or replace function fn_create_default_statuses()
returns trigger
language plpgsql
as $$
begin
  insert into task_statuses (list_id, name, color, position, is_closed)
  values
    (new.id, 'Todo',         '#6B7280', 0, false),
    (new.id, 'Em Progresso', '#3B82F6', 1, false),
    (new.id, 'Em Revisão',   '#F59E0B', 2, false),
    (new.id, 'Concluído',    '#10B981', 3, true),
    (new.id, 'Cancelado',    '#EF4444', 4, true);
  return new;
end;
$$;

create or replace trigger trg_list_default_statuses
  after insert on lists
  for each row execute function fn_create_default_statuses();

-- ----------------------------------------------------------------
-- log activity when a task's status changes
-- ----------------------------------------------------------------
create or replace function fn_log_task_status_change()
returns trigger
language plpgsql
as $$
begin
  if (old.status_id is distinct from new.status_id) then
    insert into activity_log (task_id, actor_id, action, old_value, new_value)
    values (
      new.id,
      new.created_by,      -- best proxy without request context
      'status_changed',
      jsonb_build_object('status_id', old.status_id),
      jsonb_build_object('status_id', new.status_id)
    );
  end if;
  return new;
end;
$$;

create or replace trigger trg_task_status_change
  after update on tasks
  for each row
  when (old.status_id is distinct from new.status_id)
  execute function fn_log_task_status_change();

-- ================================================================
-- ROW-LEVEL SECURITY
-- ================================================================
alter table profiles          enable row level security;
alter table workspaces        enable row level security;
alter table workspace_members enable row level security;
alter table spaces            enable row level security;
alter table projects          enable row level security;
alter table lists             enable row level security;
alter table task_statuses     enable row level security;
alter table tasks             enable row level security;
alter table task_assignees    enable row level security;
alter table tags              enable row level security;
alter table task_tags         enable row level security;
alter table comments          enable row level security;
alter table attachments       enable row level security;
alter table activity_log      enable row level security;
alter table notifications     enable row level security;

-- ----------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------
create policy "profiles: users can read their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: users can update their own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: workspace members can read each other"
  on profiles for select
  using (
    exists (
      select 1 from workspace_members wm1
      join   workspace_members wm2 on wm1.workspace_id = wm2.workspace_id
      where  wm1.user_id = auth.uid()
      and    wm2.user_id = profiles.id
    )
  );

-- ----------------------------------------------------------------
-- workspaces
-- ----------------------------------------------------------------
create policy "workspaces: members can read"
  on workspaces for select
  using (is_workspace_member(id, auth.uid()));

create policy "workspaces: owner can update"
  on workspaces for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "workspaces: owner can delete"
  on workspaces for delete
  using (owner_id = auth.uid());

create policy "workspaces: authenticated users can create"
  on workspaces for insert
  with check (auth.uid() = owner_id);

-- ----------------------------------------------------------------
-- workspace_members
-- ----------------------------------------------------------------
create policy "workspace_members: members can read"
  on workspace_members for select
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "workspace_members: admins/owners can insert"
  on workspace_members for insert
  with check (
    exists (
      select 1 from workspace_members
      where  workspace_id = workspace_members.workspace_id
      and    user_id      = auth.uid()
      and    role in ('owner', 'admin')
    )
  );

create policy "workspace_members: admins/owners can delete"
  on workspace_members for delete
  using (
    exists (
      select 1 from workspace_members wm
      where  wm.workspace_id = workspace_members.workspace_id
      and    wm.user_id      = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
    or user_id = auth.uid()   -- members may leave
  );

create policy "workspace_members: admins/owners can update role"
  on workspace_members for update
  using (
    exists (
      select 1 from workspace_members wm
      where  wm.workspace_id = workspace_members.workspace_id
      and    wm.user_id      = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- spaces
-- ----------------------------------------------------------------
create policy "spaces: workspace members can read non-private"
  on spaces for select
  using (
    is_workspace_member(workspace_id, auth.uid())
    and (not is_private or created_by = auth.uid())
  );

create policy "spaces: workspace members can insert"
  on spaces for insert
  with check (is_workspace_member(workspace_id, auth.uid()));

create policy "spaces: creator / admin can update"
  on spaces for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from workspace_members
      where  workspace_id = spaces.workspace_id
      and    user_id      = auth.uid()
      and    role in ('owner', 'admin')
    )
  );

create policy "spaces: creator / admin can delete"
  on spaces for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from workspace_members
      where  workspace_id = spaces.workspace_id
      and    user_id      = auth.uid()
      and    role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- projects  (access via space → workspace membership)
-- ----------------------------------------------------------------
create policy "projects: workspace members can read"
  on projects for select
  using (
    exists (
      select 1 from spaces s
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  s.id          = projects.space_id
      and    wm.user_id    = auth.uid()
    )
  );

create policy "projects: workspace members can insert"
  on projects for insert
  with check (
    exists (
      select 1 from spaces s
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  s.id       = projects.space_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "projects: creator / admin can update"
  on projects for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from spaces s
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  s.id       = projects.space_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

create policy "projects: creator / admin can delete"
  on projects for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from spaces s
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  s.id       = projects.space_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- lists
-- ----------------------------------------------------------------
create policy "lists: workspace members can read"
  on lists for select
  using (
    exists (
      select 1 from projects p
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  p.id       = lists.project_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "lists: workspace members can insert"
  on lists for insert
  with check (
    exists (
      select 1 from projects p
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  p.id       = lists.project_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "lists: creator / admin can update"
  on lists for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from projects p
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  p.id       = lists.project_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

create policy "lists: creator / admin can delete"
  on lists for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from projects p
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  p.id       = lists.project_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- task_statuses
-- ----------------------------------------------------------------
create policy "task_statuses: workspace members can read"
  on task_statuses for select
  using (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = task_statuses.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_statuses: workspace members can insert"
  on task_statuses for insert
  with check (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = task_statuses.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_statuses: workspace members can update"
  on task_statuses for update
  using (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = task_statuses.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_statuses: admins can delete"
  on task_statuses for delete
  using (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = task_statuses.list_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- tasks
-- ----------------------------------------------------------------
create policy "tasks: workspace members can read"
  on tasks for select
  using (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = tasks.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "tasks: workspace members can insert"
  on tasks for insert
  with check (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = tasks.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "tasks: workspace members can update"
  on tasks for update
  using (
    exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = tasks.list_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "tasks: creator / admin can delete"
  on tasks for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from lists l
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  l.id       = tasks.list_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- task_assignees
-- ----------------------------------------------------------------
create policy "task_assignees: workspace members can read"
  on task_assignees for select
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_assignees.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_assignees: workspace members can insert"
  on task_assignees for insert
  with check (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_assignees.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_assignees: workspace members can delete"
  on task_assignees for delete
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_assignees.task_id
      and    wm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- tags
-- ----------------------------------------------------------------
create policy "tags: workspace members can read"
  on tags for select
  using (is_workspace_member(workspace_id, auth.uid()));

create policy "tags: workspace members can insert"
  on tags for insert
  with check (is_workspace_member(workspace_id, auth.uid()));

create policy "tags: admins can update"
  on tags for update
  using (
    exists (
      select 1 from workspace_members
      where  workspace_id = tags.workspace_id
      and    user_id      = auth.uid()
      and    role in ('owner', 'admin')
    )
  );

create policy "tags: admins can delete"
  on tags for delete
  using (
    exists (
      select 1 from workspace_members
      where  workspace_id = tags.workspace_id
      and    user_id      = auth.uid()
      and    role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- task_tags
-- ----------------------------------------------------------------
create policy "task_tags: workspace members can read"
  on task_tags for select
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_tags.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_tags: workspace members can insert"
  on task_tags for insert
  with check (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_tags.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "task_tags: workspace members can delete"
  on task_tags for delete
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = task_tags.task_id
      and    wm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- comments
-- ----------------------------------------------------------------
create policy "comments: workspace members can read"
  on comments for select
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = comments.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "comments: workspace members can insert"
  on comments for insert
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = comments.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "comments: author can update"
  on comments for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "comments: author / admin can delete"
  on comments for delete
  using (
    author_id = auth.uid()
    or exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = comments.task_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- attachments
-- ----------------------------------------------------------------
create policy "attachments: workspace members can read"
  on attachments for select
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = attachments.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "attachments: workspace members can insert"
  on attachments for insert
  with check (
    auth.uid() = uploaded_by
    and exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = attachments.task_id
      and    wm.user_id = auth.uid()
    )
  );

create policy "attachments: uploader / admin can delete"
  on attachments for delete
  using (
    uploaded_by = auth.uid()
    or exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = attachments.task_id
      and    wm.user_id = auth.uid()
      and    wm.role in ('owner', 'admin')
    )
  );

-- ----------------------------------------------------------------
-- activity_log  (read-only via RLS; writes are trigger-only)
-- ----------------------------------------------------------------
create policy "activity_log: workspace members can read"
  on activity_log for select
  using (
    exists (
      select 1 from tasks t
      join   lists l           on l.id          = t.list_id
      join   projects p        on p.id          = l.project_id
      join   spaces s          on s.id          = p.space_id
      join   workspace_members wm on wm.workspace_id = s.workspace_id
      where  t.id       = activity_log.task_id
      and    wm.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- notifications  (each user sees only their own)
-- ----------------------------------------------------------------
create policy "notifications: user can read own"
  on notifications for select
  using (user_id = auth.uid());

create policy "notifications: user can update own (mark read)"
  on notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications: user can delete own"
  on notifications for delete
  using (user_id = auth.uid());
