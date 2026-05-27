'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  X,
  Calendar,
  User,
  Tag,
  AlignLeft,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/src/lib/utils/cn'
import { useUIStore } from '@/src/lib/store/uiStore'
import { taskKeys, fetchTaskById, fetchStatusesByList } from '@/src/lib/queries/tasks'
import { useUpdateTask, useUpdateTaskStatus } from '@/src/lib/mutations/tasks'
import { PRIORITY_CONFIG } from '@/src/lib/constants/priorities'
import { TaskStatusBadge } from './TaskStatusBadge'
import { TaskPriorityBadge } from './TaskPriorityBadge'
import type { Priority } from '@/src/types/index'

const PRIORITIES: Priority[] = ['urgent', 'high', 'normal', 'low', 'none']

export function TaskDetailPanel() {
  const { taskDetailId, setTaskDetailId } = useUIStore()
  const isOpen = !!taskDetailId

  const { data: task, isLoading } = useQuery({
    queryKey: taskKeys.detail(taskDetailId ?? ''),
    queryFn: () => fetchTaskById(taskDetailId!),
    enabled: !!taskDetailId,
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses', 'list', task?.list_id ?? ''],
    queryFn: () => fetchStatusesByList(task!.list_id),
    enabled: !!task?.list_id,
  })

  const updateTask = useUpdateTask(task?.list_id ?? '')
  const updateStatus = useUpdateTaskStatus(task?.list_id ?? '')

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [priorityOpen, setPriorityOpen] = useState(false)

  useEffect(() => {
    if (task) setTitleDraft(task.title)
  }, [task])

  function commitTitle() {
    if (!task) return
    const trimmed = titleDraft.trim()
    if (trimmed && trimmed !== task.title) {
      updateTask.mutate({ id: task.id, title: trimmed })
    } else {
      setTitleDraft(task.title)
    }
    setEditingTitle(false)
  }

  function handleStatusChange(statusId: string) {
    if (!task) return
    updateStatus.mutate({ taskId: task.id, statusId })
  }

  function handlePriorityChange(p: Priority) {
    if (!task) return
    updateTask.mutate({ id: task.id, priority: p })
    setPriorityOpen(false)
  }

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!task) return
    updateTask.mutate({ id: task.id, due_date: e.target.value || null })
  }

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setTaskDetailId(null)}
        />
      )}

      {/* Panel */}
      <aside
        className={cn(
          'fixed right-0 top-0 bottom-0 z-40 flex flex-col',
          'w-full max-w-md bg-white dark:bg-gray-900',
          'border-l border-gray-200 dark:border-gray-800',
          'shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        aria-hidden={!isOpen}
      >
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        )}

        {!isLoading && !task && isOpen && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-400">
            <p className="text-sm">Task not found</p>
            <button
              onClick={() => setTaskDetailId(null)}
              className="text-xs underline"
            >
              Close
            </button>
          </div>
        )}

        {task && (
          <>
            {/* Header */}
            <div className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={commitTitle}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitTitle()
                      if (e.key === 'Escape') {
                        setTitleDraft(task.title)
                        setEditingTitle(false)
                      }
                    }}
                    className="w-full text-sm font-semibold bg-transparent border-b border-orange-400 outline-none text-gray-900 dark:text-gray-100 py-0.5"
                  />
                ) : (
                  <h2
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 break-words"
                    onClick={() => setEditingTitle(true)}
                    title="Click to edit"
                  >
                    {task.title}
                  </h2>
                )}

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <TaskStatusBadge
                    status={task.status}
                    statuses={statuses ?? []}
                    onStatusChange={handleStatusChange}
                  />

                  {/* Priority dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      className="flex items-center gap-1"
                      onClick={() => setPriorityOpen((o) => !o)}
                    >
                      <TaskPriorityBadge priority={task.priority} />
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </button>
                    {priorityOpen && (
                      <div className="absolute z-50 mt-1 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg min-w-[140px] py-1">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p}
                            type="button"
                            className={cn(
                              'w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700',
                              p === task.priority && 'bg-gray-50 dark:bg-gray-700'
                            )}
                            onClick={() => handlePriorityChange(p)}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: PRIORITY_CONFIG[p].color }}
                            />
                            {PRIORITY_CONFIG[p].label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTaskDetailId(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {/* Description */}
              <section className="px-4 py-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  <AlignLeft className="w-3.5 h-3.5" />
                  Description
                </h3>
                <textarea
                  defaultValue={
                    typeof task.description === 'string'
                      ? task.description
                      : task.description
                      ? JSON.stringify(task.description, null, 2)
                      : ''
                  }
                  onBlur={(e) => {
                    if (e.target.value !== (task.description ?? '')) {
                      updateTask.mutate({ id: task.id, description: e.target.value })
                    }
                  }}
                  placeholder="Add a description…"
                  rows={4}
                  className={cn(
                    'w-full text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 resize-none',
                    'border border-transparent focus:border-orange-400',
                    'text-gray-800 dark:text-gray-200 placeholder:text-gray-400',
                    'focus:outline-none transition-colors'
                  )}
                />
              </section>

              {/* Assignees */}
              <section className="px-4 py-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  <User className="w-3.5 h-3.5" />
                  Assignees
                </h3>
                {task.assignees && task.assignees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {task.assignees.map(({ user }) => (
                      <div
                        key={user?.id}
                        className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1"
                      >
                        <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden">
                          {user?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={user.avatar_url} alt={user.full_name ?? ''} className="w-full h-full object-cover" />
                          ) : (
                            (user?.full_name ?? user?.email ?? '?').charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-xs text-gray-700 dark:text-gray-300">
                          {user?.full_name ?? user?.email}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No assignees</p>
                )}
              </section>

              {/* Due Date */}
              <section className="px-4 py-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </h3>
                <input
                  type="date"
                  defaultValue={task.due_date ? format(parseISO(task.due_date), 'yyyy-MM-dd') : ''}
                  onChange={handleDueDateChange}
                  className={cn(
                    'text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-transparent',
                    'focus:border-orange-400 focus:outline-none',
                    'text-gray-800 dark:text-gray-200 transition-colors'
                  )}
                />
              </section>

              {/* Tags */}
              <section className="px-4 py-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </h3>
                {task.tags && task.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {task.tags.map(({ tag }) => (
                      <span
                        key={tag?.id}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: tag?.color ? `${tag.color}25` : '#F3F4F6',
                          color: tag?.color ?? '#6B7280',
                        }}
                      >
                        {tag?.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No tags</p>
                )}
              </section>

              {/* Comments placeholder */}
              <section className="px-4 py-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                  Comments
                </h3>
                <div className="space-y-3">
                  {task.comments && task.comments.length > 0 ? (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-2">
                        <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-[9px] font-bold text-white flex-shrink-0">
                          {(comment.author?.full_name ?? comment.author?.email ?? '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">
                            {comment.author?.full_name ?? comment.author?.email}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {typeof comment.content === 'string'
                              ? comment.content
                              : JSON.stringify(comment.content)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No comments yet</p>
                  )}
                </div>

                {/* Comment input */}
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a comment…"
                    className={cn(
                      'flex-1 text-sm bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-1.5 border border-transparent',
                      'focus:border-orange-400 focus:outline-none',
                      'text-gray-800 dark:text-gray-200 placeholder:text-gray-400',
                      'transition-colors'
                    )}
                  />
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-medium bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </section>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
