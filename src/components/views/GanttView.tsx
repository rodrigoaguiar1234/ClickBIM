'use client'

import { useState, useMemo } from 'react'
import { addDays, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import { useUIStore } from '@/src/lib/store/uiStore'
import type { Task, TaskStatus } from '@/src/types/index'

// Dynamically import to avoid SSR issues with gantt-task-react
import dynamic from 'next/dynamic'

const GanttChart = dynamic(
  () => import('./GanttChartInner').then((m) => m.GanttChartInner),
  { ssr: false, loading: () => <GanttSkeleton /> }
)

function GanttSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

interface GanttViewProps {
  statuses: TaskStatus[]
  tasks: Task[]
  listId: string
}

export type GanttViewMode = 'Day' | 'Week' | 'Month'

export function GanttView({ statuses, tasks, listId }: GanttViewProps) {
  const [viewMode, setViewMode] = useState<GanttViewMode>('Week')
  const { setTaskDetailId } = useUIStore()

  const tasksWithDates = useMemo(() => {
    const today = new Date()
    return tasks.map((task) => ({
      ...task,
      resolvedStart: task.start_date ? parseISO(task.start_date) : today,
      resolvedEnd: task.due_date ? parseISO(task.due_date) : addDays(today, 7),
      hasDates: !!(task.start_date || task.due_date),
    }))
  }, [tasks])

  const tasksForDisplay = tasksWithDates.filter((t) => t.hasDates)
  const tasksWithoutDates = tasksWithDates.filter((t) => !t.hasDates)

  const VIEW_MODES: GanttViewMode[] = ['Day', 'Week', 'Month']

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === mode
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {mode}
            </button>
          ))}
        </div>

        {tasksWithoutDates.length > 0 && (
          <p className="text-xs text-gray-400">
            {tasksWithoutDates.length} task{tasksWithoutDates.length !== 1 ? 's' : ''} without dates hidden
          </p>
        )}
      </div>

      {/* Chart area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
        {tasksForDisplay.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-400">
            <Calendar className="w-12 h-12 opacity-30" />
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">No tasks with dates</p>
              <p className="text-xs mt-1">Add start or due dates to tasks to see them here</p>
            </div>
          </div>
        ) : (
          <GanttChart
            tasks={tasksForDisplay}
            statuses={statuses}
            viewMode={viewMode}
            onTaskClick={(task) => setTaskDetailId(task.id)}
          />
        )}
      </div>
    </div>
  )
}
