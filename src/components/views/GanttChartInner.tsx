'use client'

import { Gantt, Task as GanttTask, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
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

const VIEW_MODE_MAP: Record<GanttViewMode, ViewMode> = {
  Day: ViewMode.Day,
  Week: ViewMode.Week,
  Month: ViewMode.Month,
}

function toGanttTask(task: GanttTaskWithMeta, statusColor: string): GanttTask {
  return {
    start: task.resolvedStart,
    end: task.resolvedEnd,
    name: task.title,
    id: task.id,
    type: 'task',
    progress: task.status?.is_closed ? 100 : 0,
    isDisabled: false,
    styles: {
      progressColor: statusColor,
      progressSelectedColor: statusColor,
      backgroundColor: `${statusColor}99`,
      backgroundSelectedColor: statusColor,
    },
  }
}

export function GanttChartInner({
  tasks,
  statuses,
  viewMode,
  onTaskClick,
}: GanttChartInnerProps) {
  const statusColorMap = new Map(statuses.map((s) => [s.id, s.color]))

  const ganttTasks: GanttTask[] = tasks.map((task) => {
    const color = (task.status_id ? statusColorMap.get(task.status_id) : undefined) ?? '#F97316'
    // Ensure end is always after start
    const start = task.resolvedStart
    const end = task.resolvedEnd <= start
      ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
      : task.resolvedEnd
    return toGanttTask({ ...task, resolvedEnd: end }, color)
  })

  if (ganttTasks.length === 0) return null

  return (
    <Gantt
      tasks={ganttTasks}
      viewMode={VIEW_MODE_MAP[viewMode]}
      onDateChange={() => {}} // handled via detail panel
      onProgressChange={() => {}}
      onDoubleClick={(task) => {
        const original = tasks.find((t) => t.id === task.id)
        if (original) onTaskClick(original)
      }}
      onClick={(task) => {
        const original = tasks.find((t) => t.id === task.id)
        if (original) onTaskClick(original)
      }}
      listCellWidth="200px"
      columnWidth={viewMode === 'Day' ? 60 : viewMode === 'Week' ? 180 : 300}
      barCornerRadius={4}
      handleWidth={6}
      todayColor="rgba(249,115,22,0.1)"
      projectProgressColor="#F97316"
      projectProgressSelectedColor="#EA580C"
    />
  )
}
