'use client'

import { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { cn } from '@/src/lib/utils/cn'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import type { Task } from '@/src/types/index'

interface TaskCardProps {
  task: Task
  onOpen: (taskId: string) => void
  isDragging?: boolean
}

function AssigneeAvatars({ assignees }: { assignees: NonNullable<Task['assignees']> }) {
  const visible = assignees.slice(0, 3)
  const extra = assignees.length - visible.length

  return (
    <div className="flex -space-x-1.5">
      {visible.map(({ user }) => (
        <div
          key={user?.id}
          className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden flex-shrink-0"
          title={user?.full_name ?? user?.email}
        >
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.avatar_url}
              alt={user.full_name ?? ''}
              className="w-full h-full object-cover"
            />
          ) : (
            (user?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-[9px] font-bold text-gray-600 dark:text-gray-300">
          +{extra}
        </div>
      )}
    </div>
  )
}

export function TaskCard({ task, onOpen, isDragging = false }: TaskCardProps) {
  const statusColor = task.status?.color ?? '#9CA3AF'

  const dueDateInfo = useMemo(() => {
    if (!task.due_date) return null
    const date = parseISO(task.due_date)
    const overdue = isPast(date) && !isToday(date)
    const dueToday = isToday(date)
    return {
      label: format(date, 'MMM d'),
      overdue,
      dueToday,
    }
  }, [task.due_date])

  const tags = task.tags?.map((t) => t.tag).filter(Boolean) ?? []
  const assignees = task.assignees ?? []

  return (
    <div
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(task.id)}
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700',
        'overflow-hidden cursor-pointer select-none',
        'transition-all duration-150',
        isDragging
          ? 'shadow-xl rotate-1 scale-105 border-orange-400'
          : 'hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      {/* Status color left border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-lg"
        style={{ backgroundColor: statusColor }}
      />

      <div className="px-3 py-2.5 pl-3.5">
        {/* Title */}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 mb-2 leading-snug">
          {task.title}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag!.id}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
                style={{
                  backgroundColor: tag!.color ? `${tag!.color}25` : '#F3F4F6',
                  color: tag!.color ?? '#6B7280',
                }}
              >
                {tag!.name}
              </span>
            ))}
          </div>
        )}

        {/* Footer row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <TaskPriorityBadge priority={task.priority} compact />

            {dueDateInfo && (
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded',
                  dueDateInfo.overdue
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    : dueDateInfo.dueToday
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                <Calendar className="w-2.5 h-2.5" />
                {dueDateInfo.label}
              </span>
            )}
          </div>

          {assignees.length > 0 && <AssigneeAvatars assignees={assignees} />}
        </div>
      </div>
    </div>
  )
}
