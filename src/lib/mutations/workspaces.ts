'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/src/lib/supabase/client'
import type { Space, Project, List, WorkspaceRole } from '@/src/types'

// ─── Helper ──────────────────────────────────────────────────────────────────
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// ─── useCreateWorkspace ───────────────────────────────────────────────────────
export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({ name, userId }: { name: string; userId: string }) => {
      const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6)

      const { data: ws, error: wsErr } = await supabase
        .from('workspaces')
        .insert({ name, slug, owner_id: userId, color: '#F97316' })
        .select()
        .single()

      if (wsErr) throw new Error(wsErr.message)

      const { error: memErr } = await supabase
        .from('workspace_members')
        .insert({ workspace_id: ws.id, user_id: userId, role: 'owner' as WorkspaceRole })

      if (memErr) throw new Error(memErr.message)

      return ws
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

// ─── useUpdateWorkspace ───────────────────────────────────────────────────────
export function useUpdateWorkspace() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      workspaceId,
      name,
      logoUrl,
    }: {
      workspaceId: string
      name?: string
      logoUrl?: string
    }) => {
      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (name !== undefined) updates.name = name
      if (logoUrl !== undefined) updates.logo_url = logoUrl

      const { data, error } = await supabase
        .from('workspaces')
        .update(updates)
        .eq('id', workspaceId)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['workspace', vars.workspaceId] })
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

// ─── useCreateSpace ───────────────────────────────────────────────────────────
export function useCreateSpace() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      workspaceId,
      name,
      color,
      icon,
      userId,
    }: {
      workspaceId: string
      name: string
      color: string
      icon: string
      userId: string
    }) => {
      // Get max position
      const { data: existing } = await supabase
        .from('spaces')
        .select('position')
        .eq('workspace_id', workspaceId)
        .order('position', { ascending: false })
        .limit(1)

      const position = ((existing?.[0]?.position as number) ?? 0) + 1

      const { data, error } = await supabase
        .from('spaces')
        .insert({
          workspace_id: workspaceId,
          name,
          color,
          icon,
          is_private: false,
          position,
          created_by: userId,
        } as Partial<Space>)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as Space
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['spaces', vars.workspaceId] })
    },
  })
}

// ─── useCreateProject ─────────────────────────────────────────────────────────
export function useCreateProject() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      spaceId,
      name,
      description,
      color,
      dueDate,
      userId,
    }: {
      spaceId: string
      name: string
      description?: string
      color?: string
      dueDate?: string
      userId: string
    }) => {
      // Get max position
      const { data: existing } = await supabase
        .from('projects')
        .select('position')
        .eq('space_id', spaceId)
        .order('position', { ascending: false })
        .limit(1)

      const position = ((existing?.[0]?.position as number) ?? 0) + 1

      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          space_id: spaceId,
          name,
          description: description ?? null,
          color: color ?? '#6366F1',
          due_date: dueDate ?? null,
          status: 'active',
          position,
          created_by: userId,
        } as Partial<Project>)
        .select()
        .single()

      if (projErr) throw new Error(projErr.message)

      // Create default "Tarefas" list
      const { data: list, error: listErr } = await supabase
        .from('lists')
        .insert({
          project_id: project.id,
          name: 'Tarefas',
          position: 1,
          is_archived: false,
          created_by: userId,
        } as Partial<List>)
        .select()
        .single()

      if (listErr) throw new Error(listErr.message)

      // Create default statuses for the list
      const defaultStatuses = [
        { name: 'A Fazer', color: '#94A3B8', position: 1, is_closed: false },
        { name: 'Em Andamento', color: '#F97316', position: 2, is_closed: false },
        { name: 'Concluído', color: '#22C55E', position: 3, is_closed: true },
      ]

      const { error: statusErr } = await supabase.from('task_statuses').insert(
        defaultStatuses.map((s) => ({ ...s, list_id: list.id }))
      )

      if (statusErr) console.warn('Could not create default statuses:', statusErr.message)

      return project as Project
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['projects', vars.spaceId] })
    },
  })
}

// ─── useCreateList ────────────────────────────────────────────────────────────
export function useCreateList() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async ({
      projectId,
      name,
      color,
      userId,
    }: {
      projectId: string
      name: string
      color?: string
      userId: string
    }) => {
      const { data: existing } = await supabase
        .from('lists')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1)

      const position = ((existing?.[0]?.position as number) ?? 0) + 1

      const { data, error } = await supabase
        .from('lists')
        .insert({
          project_id: projectId,
          name,
          color: color ?? null,
          position,
          is_archived: false,
          created_by: userId,
        } as Partial<List>)
        .select()
        .single()

      if (error) throw new Error(error.message)

      // Create default statuses for the new list
      const defaultStatuses = [
        { name: 'A Fazer', color: '#94A3B8', position: 1, is_closed: false },
        { name: 'Em Andamento', color: '#F97316', position: 2, is_closed: false },
        { name: 'Concluído', color: '#22C55E', position: 3, is_closed: true },
      ]

      const { error: statusErr } = await supabase.from('task_statuses').insert(
        defaultStatuses.map((s) => ({ ...s, list_id: data.id }))
      )

      if (statusErr) console.warn('Could not create default statuses:', statusErr.message)

      return data as List
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['lists', vars.projectId] })
    },
  })
}
