import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/src/lib/supabase/server'
import type { Project, Space, List } from '@/src/types'
import ProjectPageClient from './ProjectPageClient'

interface ProjectPageProps {
  params: Promise<{ workspaceSlug: string; spaceId: string; projectId: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceSlug, spaceId, projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch project
  const { data: project, error: projErr } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (projErr || !project) notFound()

  // Fetch space
  const { data: space } = await supabase
    .from('spaces')
    .select('*')
    .eq('id', spaceId)
    .single()

  // Fetch lists with task counts (using count aggregation)
  const { data: listsRaw } = await supabase
    .from('lists')
    .select(`
      *,
      tasks:tasks(count)
    `)
    .eq('project_id', projectId)
    .eq('is_archived', false)
    .order('position', { ascending: true })

  const lists: List[] = (listsRaw ?? []).map((l) => {
    const countArr = l.tasks as unknown as { count: number }[] | null
    const taskCount = countArr?.[0]?.count ?? 0
    const { tasks: _tasks, ...rest } = l
    return { ...rest, task_count: taskCount } as List
  })

  return (
    <ProjectPageClient
      project={project as Project}
      space={space as Space}
      lists={lists}
      workspaceSlug={workspaceSlug}
      userId={user.id}
    />
  )
}
