'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, MoreHorizontal, Check, Trash2, ExternalLink } from 'lucide-react'
import { format, isToday, isPast, parseISO } from 'date-fns'
import { cn } from '@/src/lib/utils/cn'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import type { Task } from '@/src/types/index'

interface TaskRowProps {
  task: Task
  selected?: boolean
  onSelect?: (taskId: string, checked: boolean) => void
  onOpen?: (taskId: string) => void
  onTitleSave?: (taskId: string, newTitle: string) => void
  onDelete?: (taskId: string) => void
  onComplete?: (taskId: string) => void
}

function AssigneeAvatars({ assignees }: { assignees: NonNullable<Task['assignees']> }) {
  const visible = assignees.slice(0, 2)
  const extra = assignees.length - visible.length
  return (
    <div className="flex -space-x-1">
      {visible.map(({ user }) => (
        <div
          key={user?.id}
          title={user?.full_name ?? user?.email}
          className="w-5 h-5 rounded-full border-2 border-white dark:border-gray-800 bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden"
        >
          {user?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
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

export function TaskRow({
  task,
  selected = false,
  onSelect,
  onOpen,
  onTitleSave,
  onDelete,
  onComplete,
}: TaskRowProps) {
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const statusColor = task.status?.color ?? '#9CA3AF'
  const tags = task.tags?.map((t) => t.tag).filter(Boolean) ?? []
  const assignees = task.assignees ?? []

  const dueDateInfo = task.due_date
    ? (() => {
        const date = parseISO(task.due_date)
        const overdue = isPast(date) && !isToday(date)
        const dueToday = isToday(date)
        return { label: format(date, 'MMM d'), overdue, dueToday }
      })()
    : null

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleTitleCommit() {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title) {
      onTitleSave?.(task.id, trimmed)
    } else {
      setEditTitle(task.title)
    }
    setEditing(false)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-2 border-b border-gray-100 dark:border-gray-800',
        'hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors min-h-[40px]',
        selected && 'bg-orange-50/50 dark:bg-orange-900/10'
      )}
    >
      {/* Checkbox */}
      <div className="flex-shrink-0">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect?.(task.id, e.target.checked)}
          className="w-3.5 h-3.5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
          aria-label={`Select ${task.title}`}
        />
      </div>

      {/* Status dot */}
      <div
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: statusColor }}
        title={task.status?.name}
      />

      {/* Title */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleTitleCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleCommit()
              if (e.key === 'Escape') {
                setEditTitle(task.title)
                setEditing(false)
              }
            }}
            className="w-full text-sm bg-transparent border-b border-orange-400 outline-none text-gray-800 dark:text-gray-100 py-0.5"
          />
        ) : (
          <span
            className="text-sm text-gray-800 dark:text-gray-100 truncate block cursor-pointer hover:text-orange-600 dark:hover:text-orange-400"
            onClick={() => onOpen?.(task.id)}
            onDoubleClick={() => setEditing(true)}
          >
            {task.title}
          </span>
        )}
      </div>

      {/* Priority */}
      <div className="flex-shrink-0 w-20 hidden sm:block">
        <TaskPriorityBadge priority={task.priority} compact />
      </div>

      {/* Assignees */}
      <div className="flex-shrink-0 w-16 hidden md:flex items-center">
        {assignees.length > 0 && <AssigneeAvatars assignees={assignees} />}
      </div>

      {/* Due Date */}
      <div className="flex-shrink-0 w-20 hidden md:block">
        {dueDateInfo && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-[10px] font-medium',
              dueDateInfo.overdue
                ? 'text-red-500'
                : dueDateInfo.dueToday
                ? 'text-orange-500'
                : 'text-gray-400 dark:text-gray-500'
            )}
          >
            <Calendar className="w-2.5 h-2.5" />
            {dueDateInfo.label}
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex-shrink-0 hidden lg:flex items-center gap-1 max-w-[120px]">
        {tags.slice(0, 2).map((tag) => (
          <span
            key={tag!.id}
            className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium truncate max-w-[60px]"
            style={{
              backgroundColor: tag!.color ? `${tag!.color}25` : '#F3F4F6',
              color: tag!.color ?? '#6B7280',
            }}
          >
            {tag!.name}
          </span>
        ))}
      </div>

      {/* More options */}
      <div className="flex-shrink-0 relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-44 py-1">
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => { onOpen?.(task.id); setMenuOpen(false) }}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open task
            </button>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => { onComplete?.(task.id); setMenuOpen(false) }}
            >
              <Check className="w-3.5 h-3.5" />
              Mark complete
            </button>
            <hr className="my-1 border-gray-100 dark:border-gray-700" />
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => { onDelete?.(task.id); setMenuOpen(false) }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
