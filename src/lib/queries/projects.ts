import { createClient } from '@/src/lib/supabase/client'
import type { Project, List } from '@/src/types'

// ─── Fetch all projects in a space ───────────────────────────────────────────
export async function fetchProjectsBySpace(spaceId: string): Promise<Project[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      lists(
        id,
        tasks(id, status_id, statuses:task_statuses!tasks_status_id_fkey(is_closed))
      )
    `)
    .eq('space_id', spaceId)
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)

  // Calculate task_count and completed_count from nested data
  const projects = (data ?? []).map((p) => {
    const lists = (p.lists as Array<{ id: string; tasks: Array<{ id: string; statuses: { is_closed: boolean } | null }> }>) ?? []
    let taskCount = 0
    let completedCount = 0
    for (const list of lists) {
      const tasks = list.tasks ?? []
      taskCount += tasks.length
      completedCount += tasks.filter((t) => t.statuses?.is_closed).length
    }
    const { lists: _lists, ...rest } = p
    return { ...rest, task_count: taskCount, completed_count: completedCount } as Project
  })

  return projects
}

// ─── Fetch all lists in a project ────────────────────────────────────────────
export async function fetchListsByProject(projectId: string): Promise<List[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('lists')
    .select(`
      *,
      tasks(count)
    `)
    .eq('project_id', projectId)
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []).map((l) => {
    const count = (l.tasks as unknown as { count: number }[] | null)?.[0]?.count ?? 0
    const { tasks: _tasks, ...rest } = l
    return { ...rest, task_count: count } as List
  })
}
