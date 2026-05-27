import { createClient } from '@/src/lib/supabase/client'

export const taskKeys = {
  all: ['tasks'] as const,
  byList: (listId: string) => ['tasks', 'list', listId] as const,
  detail: (taskId: string) => ['tasks', 'detail', taskId] as const,
}

export const statusKeys = {
  all: ['statuses'] as const,
  byList: (listId: string) => ['statuses', 'list', listId] as const,
}

export async function fetchTasksByList(listId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `*,
      status:task_statuses(*),
      assignees:task_assignees(user:profiles(id,full_name,avatar_url,email)),
      tags:task_tags(tag:tags(*))`
    )
    .eq('list_id', listId)
    .is('parent_task_id', null)
    .eq('is_archived', false)
    .order('position')
  if (error) throw error
  return data
}

export async function fetchStatusesByList(listId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('task_statuses')
    .select('*')
    .eq('list_id', listId)
    .order('position')
  if (error) throw error
  return data
}

export async function fetchTaskById(taskId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select(
      `*,
      status:task_statuses(*),
      assignees:task_assignees(user:profiles(id,full_name,avatar_url,email)),
      tags:task_tags(tag:tags(*))`
    )
    .eq('id', taskId)
    .single()
  if (error) throw error
  return data
}

export async function fetchListById(listId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('lists')
    .select('*, statuses:task_statuses(*)')
    .eq('id', listId)
    .single()
  if (error) throw error
  return data
}
