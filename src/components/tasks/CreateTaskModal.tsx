'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2 } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import { useCreateTask } from '@/src/lib/mutations/tasks'
import { PRIORITY_CONFIG } from '@/src/lib/constants/priorities'
import type { TaskStatus, Priority } from '@/src/types/index'

interface CreateTaskModalProps {
  open: boolean
  listId: string
  statuses: TaskStatus[]
  defaultStatusId?: string
  onClose: () => void
  onCreated?: (taskId: string) => void
}

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

export function CreateTaskModal({
  open,
  listId,
  statuses,
  defaultStatusId,
  onClose,
  onCreated,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [statusId, setStatusId] = useState(defaultStatusId ?? statuses[0]?.id ?? '')
  const [priority, setPriority] = useState<Priority>('normal')
  const [dueDate, setDueDate] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')

  const titleRef = useRef<HTMLInputElement>(null)
  const { mutateAsync, isPending } = useCreateTask(listId)

  // Sync defaultStatusId when it changes (e.g. opened from different column)
  useEffect(() => {
    if (defaultStatusId) setStatusId(defaultStatusId)
    else if (statuses[0]) setStatusId(statuses[0].id)
  }, [defaultStatusId, statuses])

  // Focus title when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => titleRef.current?.focus(), 50)
    }
  }, [open])

  // Reset form on close
  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setPriority('normal')
      setDueDate('')
      setAssigneeEmail('')
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    try {
      const task = await mutateAsync({
        list_id: listId,
        title: title.trim(),
        description: description.trim() || undefined,
        status_id: statusId || undefined,
        priority,
        due_date: dueDate || undefined,
      })
      onCreated?.(task.id)
      onClose()
    } catch (err) {
      console.error('Failed to create task', err)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="create-task-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 id="create-task-title" className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Create Task
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title…"
              required
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                'transition-colors'
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description…"
              rows={3}
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg border resize-none',
                'border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                'transition-colors'
              )}
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={statusId}
                onChange={(e) => setStatusId(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border',
                  'border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                  'transition-colors'
                )}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border',
                  'border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                  'transition-colors'
                )}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Due Date + Assignee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border',
                  'border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                  'transition-colors'
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignee (email)
              </label>
              <input
                type="email"
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                placeholder="user@example.com"
                className={cn(
                  'w-full px-3 py-2 text-sm rounded-lg border',
                  'border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800',
                  'text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500',
                  'transition-colors'
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
                'bg-orange-500 hover:bg-orange-600',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
