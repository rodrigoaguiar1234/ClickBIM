import { createClient } from '@/src/lib/supabase/client'
import type { Workspace, WorkspaceMember } from '@/src/types'

// ─── Fetch workspaces where the user is a member ─────────────────────────────
export async function fetchUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select('workspace:workspaces(*)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)

  // Unwrap the joined workspace rows
  return (data ?? [])
    .map((row) => row.workspace as unknown as Workspace)
    .filter(Boolean)
}

// ─── Fetch a single workspace by slug ────────────────────────────────────────
export async function fetchWorkspaceBySlug(slug: string): Promise<Workspace | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // not found
    throw new Error(error.message)
  }

  return data as Workspace
}

// ─── Fetch all members of a workspace ────────────────────────────────────────
export async function fetchWorkspaceMembers(workspaceId: string): Promise<WorkspaceMember[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      id,
      workspace_id,
      user_id,
      role,
      joined_at,
      user:profiles(id, email, full_name, avatar_url)
    `)
    .eq('workspace_id', workspaceId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as unknown as WorkspaceMember[]
}
