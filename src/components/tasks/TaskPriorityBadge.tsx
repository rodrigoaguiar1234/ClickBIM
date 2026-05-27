'use client'

import { AlertOctagon, ArrowUp, Minus, ArrowDown, Circle } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import { PRIORITY_CONFIG } from '@/src/lib/constants/priorities'
import type { Priority } from '@/src/types/index'

const ICON_MAP = {
  AlertOctagon,
  ArrowUp,
  Minus,
  ArrowDown,
  Circle,
} as const

interface TaskPriorityBadgeProps {
  priority: Priority
  compact?: boolean
  className?: string
}

export function TaskPriorityBadge({ priority, compact = false, className }: TaskPriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority]
  if (!config) return null

  const iconName = config.icon as keyof typeof ICON_MAP
  const Icon = ICON_MAP[iconName] ?? Circle

  if (compact) {
    return (
      <span
        className={cn('inline-flex items-center justify-center w-4 h-4', className)}
        title={config.label}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: config.color }} strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
        config.bgClass,
        className
      )}
    >
      <Icon className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
      <span>{config.label}</span>
    </span>
  )
}
