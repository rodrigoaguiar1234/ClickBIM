export const dynamic = 'force-dynamic'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import type { Workspace } from '@/src/types'
import WorkspaceSettingsClient from './WorkspaceSettingsClient'

interface SettingsPageProps {
  params: Promise<{ workspaceSlug: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceSlug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('slug', workspaceSlug)
    .single()

  if (error || !workspace) notFound()

  // Check that the user is at least an admin
  const { data: member } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspace.id)
    .eq('user_id', user.id)
    .single()

  const isOwner = member?.role === 'owner'
  const isAdmin = member?.role === 'admin' || isOwner

  if (!isAdmin) redirect(`/${workspaceSlug}`)

  return (
    <WorkspaceSettingsClient
      workspace={workspace as Workspace}
      isOwner={isOwner}
      userId={user.id}
    />
  )
}
