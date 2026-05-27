'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import type { TaskStatus } from '@/src/types/index'

interface TaskStatusBadgeProps {
  status: TaskStatus | undefined
  statuses?: TaskStatus[]
  onStatusChange?: (statusId: string) => void
  className?: string
}

export function TaskStatusBadge({
  status,
  statuses,
  onStatusChange,
  className,
}: TaskStatusBadgeProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isClickable = statuses && statuses.length > 0 && onStatusChange

  return (
    <div className={cn('relative inline-block', className)} ref={ref}>
      <button
        type="button"
        onClick={() => isClickable && setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
          'border transition-colors',
          isClickable
            ? 'cursor-pointer hover:opacity-80'
            : 'cursor-default',
          'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
        )}
      >
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: status?.color ?? '#9CA3AF' }}
        />
        <span className="truncate max-w-[100px]">{status?.name ?? 'No Status'}</span>
        {isClickable && <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>

      {open && statuses && (
        <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[160px] py-1">
          {statuses.map((s) => (
            <button
              key={s.id}
              type="button"
              className={cn(
                'w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                s.id === status?.id && 'bg-gray-50 dark:bg-gray-700'
              )}
              onClick={() => {
                onStatusChange?.(s.id)
                setOpen(false)
              }}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: s.color }}
              />
              <span>{s.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
