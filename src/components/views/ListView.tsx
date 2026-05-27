'use client'

import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Plus, ArrowUpDown } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import { TaskRow } from '@/src/components/tasks/TaskRow'
import { CreateTaskModal } from '@/src/components/tasks/CreateTaskModal'
import { useUIStore } from '@/src/lib/store/uiStore'
import { useUpdateTask, useDeleteTask } from '@/src/lib/mutations/tasks'
import type { Task, TaskStatus } from '@/src/types/index'

interface ListViewProps {
  statuses: TaskStatus[]
  tasks: Task[]
  listId: string
}

type SortKey = 'title' | 'priority' | 'due_date' | 'none'
type SortDir = 'asc' | 'desc'

const PRIORITY_ORDER: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
  none: 4,
}

function compareBy(a: Task, b: Task, key: SortKey, dir: SortDir): number {
  let cmp = 0
  if (key === 'title') cmp = a.title.localeCompare(b.title)
  else if (key === 'priority')
    cmp = (PRIORITY_ORDER[a.priority] ?? 5) - (PRIORITY_ORDER[b.priority] ?? 5)
  else if (key === 'due_date') {
    const da = a.due_date ? new Date(a.due_date).getTime() : Infinity
    const db = b.due_date ? new Date(b.due_date).getTime() : Infinity
    cmp = da - db
  } else cmp = a.position - b.position
  return dir === 'asc' ? cmp : -cmp
}

interface GroupState {
  [statusId: string]: boolean
}

export function ListView({ statuses, tasks, listId }: ListViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('none')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [collapsed, setCollapsed] = useState<GroupState>({})
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [createForStatus, setCreateForStatus] = useState<string | null>(null)

  const { setTaskDetailId } = useUIStore()
  const updateTask = useUpdateTask(listId)
  const deleteTask = useDeleteTask(listId)

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  function toggleGroup(id: string) {
    setCollapsed((c) => ({ ...c, [id]: !c[id] }))
  }

  function handleSelect(taskId: string, checked: boolean) {
    setSelectedIds((ids) => {
      const next = new Set(ids)
      checked ? next.add(taskId) : next.delete(taskId)
      return next
    })
  }

  // Group and sort
  const groups = useMemo(() => {
    const statusMap = new Map(statuses.map((s) => [s.id, s]))
    const byStatus = new Map<string, Task[]>()
    const noStatus: Task[] = []

    for (const task of tasks) {
      const sid = task.status_id ?? ''
      if (statusMap.has(sid)) {
        const arr = byStatus.get(sid) ?? []
        arr.push(task)
        byStatus.set(sid, arr)
      } else {
        noStatus.push(task)
      }
    }

    const result = statuses.map((s) => ({
      status: s,
      tasks: (byStatus.get(s.id) ?? []).sort((a, b) => compareBy(a, b, sortKey, sortDir)),
    }))

    if (noStatus.length > 0) {
      result.push({
        status: { id: '', list_id: listId, name: 'No Status', color: '#9CA3AF', position: 9999, is_closed: false },
        tasks: noStatus.sort((a, b) => compareBy(a, b, sortKey, sortDir)),
      })
    }

    return result
  }, [statuses, tasks, sortKey, sortDir, listId])

  function SortHeader({ label, sortField }: { label: string; sortField: SortKey }) {
    const active = sortKey === sortField
    return (
      <button
        type="button"
        onClick={() => handleSort(sortField)}
        className={cn(
          'flex items-center gap-1 text-xs font-medium hover:text-orange-600 dark:hover:text-orange-400 transition-colors',
          active ? 'text-orange-600 dark:text-orange-400' : 'text-gray-500 dark:text-gray-400'
        )}
      >
        {label}
        <ArrowUpDown className={cn('w-3 h-3', !active && 'opacity-40')} />
        {active && <span className="text-[10px] opacity-70">{sortDir === 'asc' ? '↑' : '↓'}</span>}
      </button>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Column headers */}
        <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 text-xs sticky top-0 z-10">
          <div className="w-3.5 flex-shrink-0" /> {/* checkbox spacer */}
          <div className="w-2 flex-shrink-0" /> {/* dot spacer */}
          <div className="flex-1 min-w-0">
            <SortHeader label="Title" sortField="title" />
          </div>
          <div className="w-20 hidden sm:block flex-shrink-0">
            <SortHeader label="Priority" sortField="priority" />
          </div>
          <div className="w-16 hidden md:block flex-shrink-0 text-gray-500 dark:text-gray-400 text-xs font-medium">
            Assignee
          </div>
          <div className="w-20 hidden md:block flex-shrink-0">
            <SortHeader label="Due Date" sortField="due_date" />
          </div>
          <div className="hidden lg:block w-[120px] flex-shrink-0 text-gray-500 dark:text-gray-400 text-xs font-medium">
            Tags
          </div>
          <div className="w-8 flex-shrink-0" /> {/* more button spacer */}
        </div>

        {/* Groups */}
        <div className="flex-1 overflow-y-auto">
          {groups.map((group) => {
            const isCollapsed = !!collapsed[group.status.id || 'no-status']
            return (
              <div key={group.status.id || 'no-status'}>
                {/* Group header */}
                <button
                  type="button"
                  onClick={() => toggleGroup(group.status.id || 'no-status')}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-800"
                >
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  )}
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: group.status.color }}
                  />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {group.status.name}
                  </span>
                  <span className="ml-1 text-[10px] text-gray-400 bg-gray-200 dark:bg-gray-700 rounded-full px-1.5 py-0.5 font-medium">
                    {group.tasks.length}
                  </span>
                </button>

                {/* Tasks */}
                {!isCollapsed && (
                  <>
                    {group.tasks.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        selected={selectedIds.has(task.id)}
                        onSelect={handleSelect}
                        onOpen={setTaskDetailId}
                        onTitleSave={(id, title) => updateTask.mutate({ id, title })}
                        onDelete={(id) => deleteTask.mutate(id)}
                        onComplete={(id) => {
                          const closedStatus = statuses.find((s) => s.is_closed)
                          if (closedStatus) updateTask.mutate({ id, status_id: closedStatus.id })
                        }}
                      />
                    ))}

                    {/* Add task row */}
                    <button
                      type="button"
                      onClick={() => setCreateForStatus(group.status.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-xs text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-100 dark:border-gray-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add task
                    </button>
                  </>
                )}
              </div>
            )
          })}

          {groups.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
              <p className="text-sm">No tasks yet</p>
              <button
                type="button"
                onClick={() => setCreateForStatus(statuses[0]?.id ?? '')}
                className="text-xs text-orange-500 hover:underline"
              >
                + Create first task
              </button>
            </div>
          )}
        </div>
      </div>

      <CreateTaskModal
        open={!!createForStatus}
        listId={listId}
        statuses={statuses}
        defaultStatusId={createForStatus ?? undefined}
        onClose={() => setCreateForStatus(null)}
        onCreated={(id) => setTaskDetailId(id)}
      />
    </>
  )
}
