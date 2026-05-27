import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/src/lib/supabase/server'
import type { Space, Project } from '@/src/types'
import SpacePageClient from './SpacePageClient'

interface SpacePageProps {
  params: Promise<{ workspaceSlug: string; spaceId: string }>
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { workspaceSlug, spaceId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch space
  const { data: space, error: spaceErr } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  if (spaceErr || !space) notFound()

  // Fetch projects with task counts
  const { data: projectsRaw } = await supabase
    .from('projects')
    .select(`
      *,
      lists(
        id,
        tasks:tasks(
          id,
          status:task_statuses!tasks_status_id_fkey(is_closed)
        )
      )
    `)
    .eq('space_id', spaceId)
    .order('position', { ascending: true })

  const projects: Project[] = (projectsRaw ?? []).map((p) => {
    type RawTask = { id: string; status: { is_closed: boolean } | null }
    type RawList = { id: string; tasks: RawTask[] }
    const lists = (p.lists as RawList[]) ?? []
    let taskCount = 0
    let completedCount = 0
    for (const list of lists) {
      const tasks = list.tasks ?? []
      taskCount += tasks.length
      completedCount += tasks.filter((t) => t.status?.is_closed).length
    }
    const { lists: _lists, ...rest } = p
    return { ...rest, task_count: taskCount, completed_count: completedCount } as Project
  })

  return (
    <SpacePageClient
      space={space as Space}
      projects={projects}
      workspaceSlug={workspaceSlug}
      userId={user.id}
    />
  )
}
