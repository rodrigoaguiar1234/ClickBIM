export const dynamic = 'force-dynamic'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import type { Workspace, WorkspaceMember, Profile } from '@/src/types'
import MembersPageClient from './MembersPageClient'

interface MembersPageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function MembersPage({ params }: MembersPageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (wsError || !workspace) notFound()

  // Fetch members with profiles
  const { data: membersRaw } = await supabase
    .from('workspace_members')
    .select(`
      id,
      workspace_id,
      user_id,
      role,
      joined_at,
      user:profiles(id, email, full_name, avatar_url)
    `)
    .eq('workspace_id', workspace.id)
    .order('joined_at', { ascending: true })

  const members = (membersRaw ?? []) as unknown as WorkspaceMember[]

  const currentMember = members.find((m) => m.user_id === user.id)
  const canManage =
    currentMember?.role === 'owner' || currentMember?.role === 'admin'

  return (
    <MembersPageClient
      workspace={workspace as Workspace}
      members={members}
      currentUserId={user.id}
      canManage={canManage ?? false}
    />
  )
}
