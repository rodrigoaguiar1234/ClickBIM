'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Plus, List, FolderOpen, Loader2 } from 'lucide-react'
import { fetchSpacesByWorkspace } from '@/src/lib/queries/spaces'
import { fetchProjectsBySpace } from '@/src/lib/queries/projects'
import { createClient } from '@/src/lib/supabase/client'
import { cn } from '@/src/lib/utils/cn'
import CreateSpaceModal from '@/src/components/spaces/CreateSpaceModal'
import CreateProjectModal from '@/src/components/spaces/CreateProjectModal'
import type { Space, Project, List as ListType } from '@/src/types'

// ─── Lists sub-tree ───────────────────────────────────────────────────────────
function ProjectListItems({
  project,
  workspaceSlug,
  spaceId,
  activeListId,
}: {
  project: Project
  workspaceSlug: string
  spaceId: string
  activeListId: string | null
}) {
  const supabase = createClient()

  const { data: lists, isLoading } = useQuery({
    queryKey: ['lists', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lists')
        .select('*')
        .eq('project_id', project.id)
        .eq('is_archived', false)
        .order('position', { ascending: true })
      if (error) throw new Error(error.message)
      return data as ListType[]
    },
  })

  if (isLoading) {
    return (
      <div className="pl-9 py-1">
        <Loader2 size={12} className="animate-spin text-slate-600" />
      </div>
    )
  }

  return (
    <div className="mt-0.5 space-y-0.5">
      {(lists ?? []).map((list) => (
        <Link
          key={list.id}
          href={`/${workspaceSlug}/spaces/${spaceId}/projects/${project.id}/lists/${list.id}`}
          className={cn(
            'flex items-center gap-2 rounded-md px-2 py-1.5 pl-11 text-xs transition-colors',
            activeListId === list.id
              ? 'bg-orange-500/15 text-orange-400 font-medium'
              : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
          )}
        >
          <List size={12} className="shrink-0" />
          <span className="truncate">{list.name}</span>
        </Link>
      ))}
    </div>
  )
}

// ─── Project tree item ────────────────────────────────────────────────────────
function ProjectItem({
  project,
  space,
  workspaceSlug,
  activeProjectId,
  activeListId,
}: {
  project: Project
  space: Space
  workspaceSlug: string
  activeProjectId: string | null
  activeListId: string | null
}) {
  const [expanded, setExpanded] = useState(activeProjectId === project.id)
  const isActive = activeProjectId === project.id

  return (
    <div>
      <div
        className={cn(
          'group flex items-center gap-1.5 rounded-md px-2 py-1.5 cursor-pointer transition-colors',
          isActive
            ? 'bg-orange-500/10 text-orange-400'
            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
        )}
      >
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left text-xs"
        >
          <ChevronRight
            size={12}
            className={cn('shrink-0 transition-transform', expanded && 'rotate-90')}
          />
          <span
            className="h-3 w-3 shrink-0 rounded-sm"
            style={{ backgroundColor: project.color ?? '#6366F1' }}
          />
          <span className="truncate font-medium">{project.name}</span>
        </button>
        <Link
          href={`/${workspaceSlug}/spaces/${space.id}/projects/${project.id}`}
          className="ml-auto hidden group-hover:flex items-center justify-center h-5 w-5 rounded hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-colors"
          title={`Ir para ${project.name}`}
        >
          <FolderOpen size={11} />
        </Link>
      </div>

      {expanded && (
        <ProjectListItems
          project={project}
          workspaceSlug={workspaceSlug}
          spaceId={space.id}
          activeListId={activeListId}
        />
      )}
    </div>
  )
}

// ─── Space tree item ──────────────────────────────────────────────────────────
function SpaceItem({
  space,
  workspaceSlug,
  workspaceId,
  userId,
  activeSpaceId,
  activeProjectId,
  activeListId,
}: {
  space: Space
  workspaceSlug: string
  workspaceId: string
  userId: string
  activeSpaceId: string | null
  activeProjectId: string | null
  activeListId: string | null
}) {
  const [expanded, setExpanded] = useState(activeSpaceId === space.id)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const isActive = activeSpaceId === space.id

  const { data: projects, isLoading, refetch } = useQuery({
    queryKey: ['projects', space.id],
    queryFn: () => fetchProjectsBySpace(space.id),
    enabled: expanded,
  })

  return (
    <>
      <div>
        <div
          className={cn(
            'group flex items-center gap-1.5 rounded-md px-2 py-1.5 transition-colors',
            isActive
              ? 'bg-orange-500/10 text-orange-400'
              : 'text-slate-300 hover:bg-white/5'
          )}
        >
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left text-xs font-semibold"
          >
            <ChevronRight
              size={12}
              className={cn('shrink-0 transition-transform', expanded && 'rotate-90')}
            />
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-sm"
              style={{ backgroundColor: (space.color ?? '#6366F1') + '33' }}
            >
              {space.icon ?? '📁'}
            </span>
            <span className="truncate">{space.name}</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setShowCreateProject(true)
            }}
            className="hidden group-hover:flex items-center justify-center h-5 w-5 rounded hover:bg-white/10 text-slate-500 hover:text-slate-200 transition-colors"
            title="Novo Projeto"
          >
            <Plus size={12} />
          </button>
        </div>

        {expanded && (
          <div className="mt-0.5 ml-2 space-y-0.5">
            {isLoading ? (
              <div className="flex items-center gap-2 py-2 pl-4">
                <Loader2 size={12} className="animate-spin text-slate-600" />
                <span className="text-xs text-slate-600">Carregando...</span>
              </div>
            ) : (projects ?? []).length === 0 ? (
              <button
                type="button"
                onClick={() => setShowCreateProject(true)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 pl-5 text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-colors"
              >
                <Plus size={12} />
                Novo Projeto
              </button>
            ) : (
              (projects ?? []).map((project) => (
                <ProjectItem
                  key={project.id}
                  project={project}
                  space={space}
                  workspaceSlug={workspaceSlug}
                  activeProjectId={activeProjectId}
                  activeListId={activeListId}
                />
              ))
            )}
          </div>
        )}
      </div>

      {showCreateProject && (
        <CreateProjectModal
          spaceId={space.id}
          userId={userId}
          onClose={() => setShowCreateProject(false)}
          onSuccess={() => refetch()}
        />
      )}
    </>
  )
}

// ─── Main SidebarSpaceTree ────────────────────────────────────────────────────
interface SidebarSpaceTreeProps {
  workspaceId: string
  workspaceSlug: string
  userId: string
}

export default function SidebarSpaceTree({
  workspaceId,
  workspaceSlug,
  userId,
}: SidebarSpaceTreeProps) {
  const params = useParams<{
    spaceId?: string
    projectId?: string
    listId?: string
  }>()

  const activeSpaceId = params?.spaceId ?? null
  const activeProjectId = params?.projectId ?? null
  const activeListId = params?.listId ?? null

  const [showCreateSpace, setShowCreateSpace] = useState(false)

  const {
    data: spaces,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['spaces', workspaceId],
    queryFn: () => fetchSpacesByWorkspace(workspaceId),
  })

  return (
    <>
      <div className="px-3 py-2">
        {/* Section header */}
        <div className="group flex items-center justify-between mb-1 px-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-600">
            Espaços
          </span>
          <button
            type="button"
            onClick={() => setShowCreateSpace(true)}
            className="hidden group-hover:flex items-center justify-center h-5 w-5 rounded text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-colors"
            title="Novo Espaço"
          >
            <Plus size={12} />
          </button>
        </div>

        {/* Space list */}
        {isLoading ? (
          <div className="flex items-center gap-2 py-3 px-2">
            <Loader2 size={14} className="animate-spin text-slate-600" />
            <span className="text-xs text-slate-600">Carregando espaços...</span>
          </div>
        ) : (spaces ?? []).length === 0 ? (
          <button
            type="button"
            onClick={() => setShowCreateSpace(true)}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-white/10 px-3 py-2.5 text-xs text-slate-600 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5 transition-colors"
          >
            <Plus size={13} />
            Criar primeiro espaço
          </button>
        ) : (
          <div className="space-y-0.5">
            {(spaces ?? []).map((space) => (
              <SpaceItem
                key={space.id}
                space={space}
                workspaceSlug={workspaceSlug}
                workspaceId={workspaceId}
                userId={userId}
                activeSpaceId={activeSpaceId}
                activeProjectId={activeProjectId}
                activeListId={activeListId}
              />
            ))}
          </div>
        )}
      </div>

      {showCreateSpace && (
        <CreateSpaceModal
          workspaceId={workspaceId}
          userId={userId}
          onClose={() => setShowCreateSpace(false)}
          onSuccess={() => refetch()}
        />
      )}
    </>
  )
}
