'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, List, ChevronRight, Calendar, LayoutList } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CreateListModal from '@/src/components/projects/CreateListModal'
import { cn } from '@/src/lib/utils/cn'
import type { Project, Space, List as ListType } from '@/src/types'

interface ListCardProps {
  list: ListType
  href: string
}

function ListCard({ list, href }: ListCardProps) {
  const color = list.color ?? '#6366F1'
  const taskCount = list.task_count ?? 0

  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#1E293B] px-5 py-4 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
    >
      {/* Color indicator */}
      <div
        className="h-10 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Icon */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0"
        style={{ backgroundColor: color + '20' }}
      >
        <List size={16} style={{ color }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white text-sm">{list.name}</p>
        <p className="text-xs text-slate-500 mt-0.5">
          {taskCount} tarefa{taskCount !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Arrow */}
      <ChevronRight
        size={16}
        className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </Link>
  )
}

interface ProjectPageClientProps {
  project: Project
  space: Space | null
  lists: ListType[]
  workspaceSlug: string
  userId: string
}

export default function ProjectPageClient({
  project,
  space,
  lists,
  workspaceSlug,
  userId,
}: ProjectPageClientProps) {
  const [showCreateList, setShowCreateList] = useState(false)
  const router = useRouter()

  const totalTasks = lists.reduce((acc, l) => acc + (l.task_count ?? 0), 0)
  const color = project.color ?? '#6366F1'

  return (
    <div className="flex flex-col min-h-full bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-6 py-4">
          {/* Breadcrumb */}
          {space && (
            <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
              <Link
                href={`/${workspaceSlug}/spaces/${space.id}`}
                className="hover:text-slate-400 transition-colors flex items-center gap-1"
              >
                <span>{space.icon ?? '📁'}</span>
                <span>{space.name}</span>
              </Link>
              <ChevronRight size={12} />
              <span className="text-slate-400">{project.name}</span>
            </div>
          )}

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-xl font-bold text-white shrink-0"
                style={{ backgroundColor: color }}
              >
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{project.name}</h1>
                {project.description && (
                  <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateList(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 shrink-0"
            >
              <Plus size={16} />
              Nova Lista
            </button>
          </div>

          {/* Meta row */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <LayoutList size={12} />
              {lists.length} lista{lists.length !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <List size={12} />
              {totalTasks} tarefa{totalTasks !== 1 ? 's' : ''}
            </span>
            {project.due_date && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {new Date(project.due_date).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-6 py-8 flex-1">
        {lists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 mb-4">
              <LayoutList size={28} className="text-orange-400" />
            </div>
            <h2 className="text-lg font-semibold text-white">Nenhuma lista criada</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Crie uma lista para começar a adicionar tarefas ao projeto.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateList(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} />
              Criar Lista
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Listas
            </h2>

            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                href={`/${workspaceSlug}/spaces/${space?.id ?? ''}/projects/${project.id}/lists/${list.id}`}
              />
            ))}

            {/* Add list button */}
            <button
              type="button"
              onClick={() => setShowCreateList(true)}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-white/10 px-5 py-4 text-slate-600 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5 transition-all"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                <Plus size={16} />
              </div>
              <span className="text-sm font-medium">Nova Lista</span>
            </button>
          </div>
        )}
      </main>

      {showCreateList && (
        <CreateListModal
          projectId={project.id}
          userId={userId}
          onClose={() => setShowCreateList(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
