'use client'

import { Gantt } from '@svar-ui/react-gantt'
import type { Task, TaskStatus } from '@/src/types/index'
import type { GanttViewMode } from './GanttView'

interface GanttTaskWithMeta extends Task {
  resolvedStart: Date
  resolvedEnd: Date
  hasDates: boolean
}

interface GanttChartInnerProps {
  tasks: GanttTaskWithMeta[]
  statuses: TaskStatus[]
  viewMode: GanttViewMode
  onTaskClick: (task: Task) => void
}

const SCALE_MAP: Record<GanttViewMode, string> = {
  Day: 'day',
  Week: 'week',
  Month: 'month',
}

export function GanttChartInner({
  tasks,
  statuses,
  viewMode,
  onTaskClick,
}: GanttChartInnerProps) {
  const statusColorMap = new Map(statuses.map((s) => [s.id, s.color]))

  const ganttTasks = tasks.map((task) => {
    const color =
      (task.status_id ? statusColorMap.get(task.status_id) : undefined) ??
      '#F97316'
    const start = task.resolvedStart
    const end =
      task.resolvedEnd <= start
        ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
        : task.resolvedEnd

    return {
      id: task.id,
      text: task.title,
      start,
      end,
      progress: task.status?.is_closed ? 1 : 0,
      color,
    }
  })

  if (ganttTasks.length === 0) return null

  return (
    <Gantt
      tasks={ganttTasks}
      scales={[{ unit: SCALE_MAP[viewMode] as 'day' | 'week' | 'month', step: 1, format: 'auto' }]}
      onTaskClick={(task: { id: string }) => {
        const original = tasks.find((t) => t.id === task.id)
        if (original) onTaskClick(original)
      }}
    />
  )
}
