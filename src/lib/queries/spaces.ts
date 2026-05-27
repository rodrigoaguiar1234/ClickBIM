import { createClient } from '@/src/lib/supabase/client'
import type { Space } from '@/src/types'

// ─── Fetch all spaces in a workspace ─────────────────────────────────────────
export async function fetchSpacesByWorkspace(workspaceId: string): Promise<Space[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('position', { ascending: true })

  if (error) throw new Error(error.message)

  return (data ?? []) as Space[]
}

// ─── Fetch a single space by id ───────────────────────────────────────────────
export async function fetchSpaceById(spaceId: string): Promise<Space | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as Space
}
