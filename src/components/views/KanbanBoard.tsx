'use client'

import { useState, useMemo, useCallback } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import { TaskCard } from '@/src/components/tasks/TaskCard'
import { CreateTaskModal } from '@/src/components/tasks/CreateTaskModal'
import { useUIStore } from '@/src/lib/store/uiStore'
import { useUpdateTaskPosition } from '@/src/lib/mutations/tasks'
import type { Task, TaskStatus } from '@/src/types/index'

interface KanbanBoardProps {
  statuses: TaskStatus[]
  tasks: Task[]
  listId: string
}

interface ColumnTasks {
  status: TaskStatus
  tasks: Task[]
}

export function KanbanBoard({ statuses, tasks, listId }: KanbanBoardProps) {
  const [createForStatus, setCreateForStatus] = useState<string | null>(null)
  const { setTaskDetailId } = useUIStore()
  const updatePosition = useUpdateTaskPosition(listId)

  // Group tasks by status preserving position order
  const columns: ColumnTasks[] = useMemo(() => {
    const tasksByStatus = new Map<string, Task[]>()
    for (const status of statuses) {
      tasksByStatus.set(status.id, [])
    }
    // Tasks with no status go into a fallback bucket
    const unstatused: Task[] = []

    for (const task of tasks) {
      const key = task.status_id ?? ''
      if (tasksByStatus.has(key)) {
        tasksByStatus.get(key)!.push(task)
      } else {
        unstatused.push(task)
      }
    }

    // Sort each column by position
    for (const [key, arr] of tasksByStatus) {
      tasksByStatus.set(key, arr.sort((a, b) => a.position - b.position))
    }

    const cols = statuses.map((s) => ({
      status: s,
      tasks: tasksByStatus.get(s.id) ?? [],
    }))

    if (unstatused.length > 0) {
      cols.push({ status: { id: '', list_id: listId, name: 'No Status', color: '#9CA3AF', position: 9999, is_closed: false }, tasks: unstatused })
    }

    return cols
  }, [statuses, tasks, listId])

  // Mutable local copy for optimistic drag
  const [localColumns, setLocalColumns] = useState<ColumnTasks[]>(columns)

  // Sync when upstream data changes
  useMemo(() => {
    setLocalColumns(columns)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(columns)])

  const onDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination, draggableId } = result
      if (!destination) return
      if (source.droppableId === destination.droppableId && source.index === destination.index) return

      const srcColIdx = localColumns.findIndex((c) => c.status.id === source.droppableId)
      const dstColIdx = localColumns.findIndex((c) => c.status.id === destination.droppableId)
      if (srcColIdx === -1 || dstColIdx === -1) return

      const newCols = localColumns.map((c) => ({ ...c, tasks: [...c.tasks] }))

      const [movedTask] = newCols[srcColIdx].tasks.splice(source.index, 1)
      newCols[dstColIdx].tasks.splice(destination.index, 0, movedTask)

      // Recalculate positions in the destination column
      newCols[dstColIdx].tasks = newCols[dstColIdx].tasks.map((t, i) => ({
        ...t,
        position: i + 1,
      }))

      setLocalColumns(newCols)

      const newStatusId =
        destination.droppableId !== source.droppableId
          ? destination.droppableId
          : undefined

      updatePosition.mutate({
        taskId: draggableId,
        newPosition: destination.index + 1,
        newStatusId,
      })
    },
    [localColumns, updatePosition]
  )

  return (
    <>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-3 h-full overflow-x-auto px-4 py-4 pb-6">
          {localColumns.map((col) => (
            <div
              key={col.status.id || 'no-status'}
              className="flex flex-col flex-shrink-0 w-64"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: col.status.color }}
                />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex-1 truncate">
                  {col.status.name}
                </span>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-full px-1.5 py-0.5 font-medium">
                  {col.tasks.length}
                </span>
                <button
                  type="button"
                  className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label="Column options"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Droppable tasks area */}
              <Droppable droppableId={col.status.id || 'no-status'}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'flex flex-col gap-2 flex-1 rounded-xl p-2 transition-colors min-h-[60px]',
                      snapshot.isDraggingOver
                        ? 'bg-orange-50 dark:bg-orange-900/10 ring-2 ring-orange-300/50 dark:ring-orange-600/30'
                        : 'bg-gray-50 dark:bg-gray-800/40'
                    )}
                  >
                    {col.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(dragProvided, dragSnapshot) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                          >
                            <TaskCard
                              task={task}
                              onOpen={setTaskDetailId}
                              isDragging={dragSnapshot.isDragging}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Add task button */}
              <button
                type="button"
                onClick={() => setCreateForStatus(col.status.id)}
                className={cn(
                  'mt-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400',
                  'hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-orange-600 dark:hover:text-orange-400 transition-colors w-full'
                )}
              >
                <Plus className="w-3.5 h-3.5" />
                Add task
              </button>
            </div>
          ))}
        </div>
      </DragDropContext>

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
