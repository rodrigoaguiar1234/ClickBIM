'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, FolderOpen, CheckCircle2 } from 'lucide-react'
import CreateProjectModal from '@/src/components/spaces/CreateProjectModal'
import { useRouter } from 'next/navigation'
import { cn } from '@/src/lib/utils/cn'
import type { Space, Project } from '@/src/types'

interface ProjectCardProps {
  project: Project
  href: string
}

function ProjectCard({ project, href }: ProjectCardProps) {
  const taskCount = project.task_count ?? 0
  const completedCount = project.completed_count ?? 0
  const progress = taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0
  const color = project.color ?? '#6366F1'

  return (
    <Link
      href={href}
      className="group flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#1E293B] p-5 hover:border-orange-500/40 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
    >
      {/* Top */}
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {project.name.charAt(0).toUpperCase()}
        </div>
        <FolderOpen
          size={16}
          className="text-slate-600 group-hover:text-orange-400 transition-colors"
        />
      </div>

      {/* Name & description */}
      <div className="flex-1">
        <h3 className="font-semibold text-white text-sm line-clamp-1">{project.name}</h3>
        {project.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{project.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={11} />
            {completedCount}/{taskCount} tarefas
          </span>
          <span style={{ color }}>{progress}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: color }}
          />
        </div>
      </div>

      {/* Due date */}
      {project.due_date && (
        <p className="text-xs text-slate-600">
          Prazo:{' '}
          {new Date(project.due_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })}
        </p>
      )}
    </Link>
  )
}

interface SpacePageClientProps {
  space: Space
  projects: Project[]
  workspaceSlug: string
  userId: string
}

export default function SpacePageClient({
  space,
  projects,
  workspaceSlug,
  userId,
}: SpacePageClientProps) {
  const [showCreateProject, setShowCreateProject] = useState(false)
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-full bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
              style={{ backgroundColor: (space.color ?? '#6366F1') + '33' }}
            >
              {space.icon ?? '📁'}
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">{space.name}</h1>
              <p className="text-xs text-slate-500">
                {projects.length} projeto{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateProject(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} />
            Novo Projeto
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-7xl px-6 py-8 flex-1">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-24 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-3xl mb-4">
              📁
            </div>
            <h2 className="text-lg font-semibold text-white">Nenhum projeto ainda</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xs">
              Crie seu primeiro projeto para começar a organizar as tarefas do espaço.
            </p>
            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              <Plus size={16} />
              Criar Projeto
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                href={`/${workspaceSlug}/spaces/${space.id}/projects/${project.id}`}
              />
            ))}

            {/* Create new card */}
            <button
              type="button"
              onClick={() => setShowCreateProject(true)}
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-transparent p-5 text-slate-600 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5 transition-all min-h-[200px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                <Plus size={20} />
              </div>
              <span className="text-sm font-medium">Novo Projeto</span>
            </button>
          </div>
        )}
      </main>

      {showCreateProject && (
        <CreateProjectModal
          spaceId={space.id}
          userId={userId}
          onClose={() => setShowCreateProject(false)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
