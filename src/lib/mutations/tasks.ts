'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/src/lib/supabase/client'
import { taskKeys, statusKeys } from '@/src/lib/queries/tasks'
import type { Task, Priority } from '@/src/types/index'

// ─── Create Task ────────────────────────────────────────────────────────────

interface CreateTaskInput {
  list_id: string
  title: string
  description?: unknown
  status_id?: string
  priority?: Priority
  due_date?: string
  start_date?: string
  assignee_ids?: string[]
}

export function useCreateTask(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const supabase = createClient()

      // Calculate next position
      const { count } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('list_id', input.list_id)
        .is('parent_task_id', null)

      const { assignee_ids, ...rest } = input
      const { data: task, error } = await supabase
        .from('tasks')
        .insert({ ...rest, position: (count ?? 0) + 1, is_archived: false })
        .select()
        .single()

      if (error) throw error

      // Insert assignees if provided
      if (assignee_ids && assignee_ids.length > 0) {
        const { error: assigneeError } = await supabase
          .from('task_assignees')
          .insert(assignee_ids.map((uid) => ({ task_id: task.id, user_id: uid })))
        if (assigneeError) throw assigneeError
      }

      return task
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(listId) })
    },
  })
}

// ─── Update Task ────────────────────────────────────────────────────────────

interface UpdateTaskInput {
  id: string
  title?: string
  description?: unknown
  priority?: Priority
  due_date?: string | null
  start_date?: string | null
  status_id?: string
}

export function useUpdateTask(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateTaskInput) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(listId) })
    },
  })
}

// ─── Update Task Status ──────────────────────────────────────────────────────

interface UpdateTaskStatusInput {
  taskId: string
  statusId: string
}

export function useUpdateTaskStatus(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, statusId }: UpdateTaskStatusInput) => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('tasks')
        .update({ status_id: statusId, updated_at: new Date().toISOString() })
        .eq('id', taskId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    // Optimistic update
    onMutate: async ({ taskId, statusId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byList(listId) })
      const previous = queryClient.getQueryData(taskKeys.byList(listId))
      queryClient.setQueryData(taskKeys.byList(listId), (old: Task[] | undefined) =>
        old?.map((t) => (t.id === taskId ? { ...t, status_id: statusId } : t))
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.byList(listId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(listId) })
    },
  })
}

// ─── Delete Task ─────────────────────────────────────────────────────────────

export function useDeleteTask(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (taskId: string) => {
      const supabase = createClient()
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(listId) })
    },
  })
}

// ─── Update Task Position ────────────────────────────────────────────────────

interface UpdateTaskPositionInput {
  taskId: string
  newPosition: number
  newStatusId?: string
}

export function useUpdateTaskPosition(listId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ taskId, newPosition, newStatusId }: UpdateTaskPositionInput) => {
      const supabase = createClient()
      const updates: Record<string, unknown> = {
        position: newPosition,
        updated_at: new Date().toISOString(),
      }
      if (newStatusId !== undefined) {
        updates.status_id = newStatusId
      }
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async ({ taskId, newPosition, newStatusId }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.byList(listId) })
      const previous = queryClient.getQueryData(taskKeys.byList(listId))
      queryClient.setQueryData(taskKeys.byList(listId), (old: Task[] | undefined) =>
        old?.map((t) =>
          t.id === taskId
            ? { ...t, position: newPosition, ...(newStatusId ? { status_id: newStatusId } : {}) }
            : t
        )
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(taskKeys.byList(listId), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.byList(listId) })
    },
  })
}
