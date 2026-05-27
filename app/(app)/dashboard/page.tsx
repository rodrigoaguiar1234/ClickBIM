import { redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import type { DashboardStats, Task, ActivityLog, Space } from '@/src/types'
import DashboardPageClient from './DashboardPageClient'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch the user's first workspace membership
  const { data: memberRow } = await supabase
    .from('workspace_members')
    .select('workspace_id, role, workspace:workspaces(id, name, slug)')
    .eq('user_id', user.id)
    .order('joined_at', { ascending: true })
    .limit(1)
    .single()

  if (!memberRow) {
    redirect('/new-workspace')
  }

  const workspaceId = memberRow.workspace_id
  const workspace = memberRow.workspace as unknown as { id: string; name: string; slug: string } | null

  // ── Tasks in workspace lists ──────────────────────────────────────────────
  // We do this by getting tasks inside lists inside projects inside spaces for this workspace
  const { data: allTasksRaw } = await supabase
    .from('tasks')
    .select(`
      id,
      title,
      due_date,
      is_archived,
      updated_at,
      status_id,
      status:task_statuses!tasks_status_id_fkey(id, name, color, is_closed),
      list:lists!tasks_list_id_fkey(
        id, name,
        project:projects!lists_project_id_fkey(
          id, name,
          space:spaces!projects_space_id_fkey(id, workspace_id)
        )
      )
    `)
    .eq('is_archived', false)
    .order('due_date', { ascending: true, nullsFirst: false })

  type RawTask = Task & {
    status: { id: string; name: string; color: string; is_closed: boolean } | null
    list?: {
      project?: {
        space?: { workspace_id: string }
      }
    }
  }

  const workspaceTasks = ((allTasksRaw ?? []) as unknown as RawTask[]).filter(
    (t) => t.list?.project?.space?.workspace_id === workspaceId
  )

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const open = workspaceTasks.filter((t) => !t.status?.is_closed).length
  const inProgress = workspaceTasks.filter(
    (t) =>
      !t.status?.is_closed &&
      (t.status?.name?.toLowerCase().includes('andamento') ||
        t.status?.name?.toLowerCase().includes('progress'))
  ).length
  const completedToday = workspaceTasks.filter(
    (t) => t.status?.is_closed && t.updated_at?.startsWith(todayStr)
  ).length
  const overdue = workspaceTasks.filter(
    (t) =>
      !t.status?.is_closed &&
      t.due_date != null &&
      new Date(t.due_date) < today
  ).length

  const stats: DashboardStats = { open, inProgress, completedToday, overdue }

  // ── My tasks (assigned to me, not closed) ────────────────────────────────
  const { data: assignedRaw } = await supabase
    .from('task_assignees')
    .select('task_id')
    .eq('user_id', user.id)

  const myTaskIds = new Set((assignedRaw ?? []).map((a: { task_id: string }) => a.task_id))
  const myTasks = workspaceTasks
    .filter((t) => myTaskIds.has(t.id) && !t.status?.is_closed)
    .slice(0, 10) as Task[]

  // ── Activity log ──────────────────────────────────────────────────────────
  // activity_logs table — adjust column names to match your schema
  const { data: activityRaw } = await supabase
    .from('activity_logs')
    .select(`
      id,
      action,
      entity_type,
      entity_id,
      created_at,
      actor_id,
      actor:profiles!activity_logs_actor_id_fkey(id, full_name, avatar_url, email)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  // ── Spaces + projects for overview section ────────────────────────────────
  const { data: spacesRaw } = await supabase
    .from('spaces')
    .select(`
      id,
      name,
      color,
      icon,
      projects(id, name, color, due_date)
    `)
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true })
    .limit(6)

  return (
    <DashboardPageClient
      stats={stats}
      myTasks={myTasks}
      activityLogs={(activityRaw ?? []) as unknown as ActivityLog[]}
      spaces={(spacesRaw ?? []) as Space[]}
      workspaceSlug={workspace?.slug ?? ''}
      userName={user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Usuário'}
    />
  )
}
