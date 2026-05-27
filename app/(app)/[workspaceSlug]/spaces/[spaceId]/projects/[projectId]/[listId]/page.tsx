export const dynamic = 'force-dynamic'
import { createClient } from '@/src/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ViewSwitcher } from '@/src/components/views/ViewSwitcher'
import { ListView } from '@/src/components/views/ListView'
import { TaskDetailPanel } from '@/src/components/tasks/TaskDetailPanel'

interface ListPageProps {
  params: Promise<{
    workspaceSlug: string
    spaceId: string
    projectId: string
    listId: string
  }>
}

export default async function ListPage({ params }: ListPageProps) {
  const { workspaceSlug, spaceId, projectId, listId } = await params

  const supabase = await createClient()

  // Fetch list with statuses
  const { data: list, error: listError } = await supabase
    .from('lists')
    .select('*, statuses:task_statuses(*)')
    .eq('id', listId)
    .single()

  if (listError || !list) notFound()

  const statuses = (list.statuses ?? []).sort(
    (a: { position: number }, b: { position: number }) => a.position - b.position
  )

  // Fetch tasks
  const { data: tasks, error: taskError } = await supabase
    .from('tasks')
    .select(
      `*, status:task_statuses(*), assignees:task_assignees(user:profiles(id,full_name,avatar_url,email)), tags:task_tags(tag:tags(*))`
    )
    .eq('list_id', listId)
    .is('parent_task_id', null)
    .eq('is_archived', false)
    .order('position')

  if (taskError) {
    console.error('Error fetching tasks:', taskError)
  }

  const basePath = `/${workspaceSlug}/spaces/${spaceId}/projects/${projectId}/${listId}`

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Breadcrumb */}
      <div className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center gap-1.5">
        <span>List</span>
        <span>/</span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">{list.name}</span>
      </div>

      <ViewSwitcher basePath={basePath} />

      <div className="flex-1 overflow-hidden bg-white dark:bg-gray-900">
        <ListView
          statuses={statuses}
          tasks={tasks ?? []}
          listId={listId}
        />
      </div>

      <TaskDetailPanel />
    </div>
  )
}
