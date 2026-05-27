// ============================================================
// ClickBIM – Shared TypeScript Interfaces
// ============================================================

// ----------------------------------------------------------------
// View types
// ----------------------------------------------------------------
export type ViewType = 'board' | 'list' | 'gantt' | 'calendar'

// ----------------------------------------------------------------
// Priority
// ----------------------------------------------------------------
export type Priority = 'urgent' | 'high' | 'normal' | 'low' | 'none'

// ----------------------------------------------------------------
// Profile
// ----------------------------------------------------------------
export interface Profile {
  id: string
  email: string
  full_name?: string | null
  avatar_url?: string | null
  created_at: string
}

// ----------------------------------------------------------------
// Workspace
// ----------------------------------------------------------------
export interface Workspace {
  id: string
  name: string
  slug: string
  logo_url?: string | null
  owner_id: string
  color: string
  created_at: string
}

// ----------------------------------------------------------------
// WorkspaceMember
// ----------------------------------------------------------------
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'viewer'

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceRole
  joined_at: string
  // Relations
  user?: Profile
  workspace?: Workspace
}

// ----------------------------------------------------------------
// Space
// ----------------------------------------------------------------
export interface Space {
  id: string
  workspace_id: string
  name: string
  color?: string | null
  icon?: string | null
  is_private: boolean
  position: number
  created_by?: string | null
  created_at: string
  // Relations
  projects?: Project[]
}

// ----------------------------------------------------------------
// Project
// ----------------------------------------------------------------
export interface Project {
  id: string
  space_id: string
  name: string
  description?: string | null
  color?: string | null
  icon?: string | null
  status: string
  position: number
  due_date?: string | null
  created_by?: string | null
  created_at: string
  // Relations
  lists?: List[]
}

// ----------------------------------------------------------------
// List
// ----------------------------------------------------------------
export interface List {
  id: string
  project_id: string
  name: string
  color?: string | null
  position: number
  is_archived: boolean
  created_by?: string | null
  created_at: string
  // Relations
  statuses?: TaskStatus[]
  tasks?: Task[]
}

// TaskList alias kept for backward compat
export type TaskList = List

// ----------------------------------------------------------------
// TaskStatus
// ----------------------------------------------------------------
export interface TaskStatus {
  id: string
  list_id: string
  name: string
  color: string
  position: number
  is_closed: boolean
}

// ----------------------------------------------------------------
// Task
// ----------------------------------------------------------------
export interface Task {
  id: string
  list_id: string
  parent_task_id?: string | null
  status_id?: string | null
  title: string
  description?: unknown | null       // Stored as ProseMirror/Tiptap JSON (jsonb)
  priority: Priority
  due_date?: string | null
  start_date?: string | null
  time_estimate?: number | null       // minutes
  position: number
  is_archived: boolean
  created_by?: string | null
  created_at: string
  updated_at: string
  // Relations
  status?: TaskStatus
  assignees?: TaskAssignee[]
  tags?: TaskTagEntry[]
  subtasks?: Task[]
  comments?: Comment[]
  attachments?: Attachment[]
}

// ----------------------------------------------------------------
// TaskAssignee
// ----------------------------------------------------------------
export interface TaskAssignee {
  task_id: string
  user_id: string
  assigned_at: string
  // Relations
  user?: Profile
}

// ----------------------------------------------------------------
// Tag
// ----------------------------------------------------------------
export interface Tag {
  id: string
  workspace_id: string
  name: string
  color?: string | null
}

// ----------------------------------------------------------------
// TaskTagEntry  (join table row with optional relation)
// ----------------------------------------------------------------
export interface TaskTagEntry {
  task_id: string
  tag_id: string
  tag?: Tag
}

// ----------------------------------------------------------------
// Comment
// ----------------------------------------------------------------
export interface Comment {
  id: string
  task_id: string
  author_id?: string | null
  content: unknown                    // ProseMirror/Tiptap JSON (jsonb)
  is_edited: boolean
  created_at: string
  updated_at: string
  // Relations
  author?: Profile
}

// ----------------------------------------------------------------
// Attachment
// ----------------------------------------------------------------
export interface Attachment {
  id: string
  task_id: string
  uploaded_by?: string | null
  file_name: string
  file_size?: number | null
  mime_type?: string | null
  storage_path: string
  created_at: string
  // Relations
  uploader?: Profile
}

// ----------------------------------------------------------------
// ActivityLog
// ----------------------------------------------------------------
export interface ActivityLog {
  id: string
  task_id: string
  actor_id?: string | null
  action: string
  old_value?: unknown | null
  new_value?: unknown | null
  created_at: string
  // Relations
  actor?: Profile
}

// ----------------------------------------------------------------
// Notification
// ----------------------------------------------------------------
export interface Notification {
  id: string
  user_id: string
  type: string
  payload?: unknown | null
  is_read: boolean
  created_at: string
}
