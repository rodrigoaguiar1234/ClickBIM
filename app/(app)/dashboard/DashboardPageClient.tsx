'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Activity,
  CheckCircle2,
  Circle,
  AlertCircle,
  Clock,
  FolderOpen,
  ChevronRight,
} from 'lucide-react'
import DashboardStats from '@/src/components/dashboard/DashboardStats'
import { cn } from '@/src/lib/utils/cn'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DashboardStats as Stats, Task, ActivityLog, Space, Project } from '@/src/types'

// ─── Task row ────────────────────────────────────────────────────────────────
function TaskRow({ task, workspaceSlug }: { task: Task & { list?: { project?: { space?: { id: string }; id: string }; id: string } }; workspaceSlug: string }) {
  const status = (task as unknown as { status?: { name: string; color: string; is_closed: boolean } }).status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue =
    task.due_date != null &&
    !status?.is_closed &&
    new Date(task.due_date) < today

  const rawTask = task as unknown as {
    list?: {
      id: string
      project?: {
        id: string
        space?: { id: string }
      }
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 px-4 py-3 hover:border-orange-500/20 hover:bg-white/5 transition-all">
      {/* Status dot */}
      <div
        className="h-2.5 w-2.5 rounded-full shrink-0"
        style={{ backgroundColor: status?.color ?? '#94A3B8' }}
      />

      {/* Title */}
      <span className="flex-1 text-sm text-white line-clamp-1">{task.title}</span>

      {/* Due date */}
      {task.due_date && (
        <span
          className={cn(
            'text-xs shrink-0',
            isOverdue ? 'text-red-400 font-medium' : 'text-slate-500'
          )}
        >
          {isOverdue && <AlertCircle size={11} className="inline mr-1 mb-0.5" />}
          {new Date(task.due_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
          })}
        </span>
      )}
    </div>
  )
}

// ─── Activity item ────────────────────────────────────────────────────────────
function ActivityItem({ log }: { log: ActivityLog }) {
  const actor = log.actor as unknown as { full_name?: string; email?: string; avatar_url?: string } | null
  const name = actor?.full_name ?? actor?.email?.split('@')[0] ?? 'Alguém'

  const actionLabel = (() => {
    switch (log.action) {
      case 'create': return 'criou'
      case 'update': return 'atualizou'
      case 'delete': return 'removeu'
      case 'assign': return 'atribuiu'
      case 'comment': return 'comentou em'
      case 'complete': return 'concluiu'
      default: return log.action
    }
  })()

  const entityLabel = (() => {
    switch (log.entity_type) {
      case 'task': return 'uma tarefa'
      case 'project': return 'um projeto'
      case 'list': return 'uma lista'
      case 'space': return 'um espaço'
      case 'comment': return 'um comentário'
      default: return log.entity_type
    }
  })()

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-xs font-semibold text-white mt-0.5">
        {actor?.avatar_url ? (
          <Image
            src={actor.avatar_url}
            alt={name}
            width={28}
            height={28}
            className="rounded-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-300">
          <strong className="text-white font-medium">{name}</strong>
          {' '}
          {actionLabel}
          {' '}
          <span className="text-slate-400">{entityLabel}</span>
        </p>
        <p className="text-xs text-slate-600 mt-0.5">
          {formatDistanceToNow(new Date(log.created_at), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>
    </div>
  )
}

// ─── Space card ───────────────────────────────────────────────────────────────
function SpaceCard({
  space,
  workspaceSlug,
}: {
  space: Space & { projects?: Project[] }
  workspaceSlug: string
}) {
  const projectCount = (space.projects ?? []).length
  const color = space.color ?? '#6366F1'

  return (
    <Link
      href={`/${workspaceSlug}/spaces/${space.id}`}
      className="group flex items-center gap-4 rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3.5 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: color + '25' }}
      >
        {space.icon ?? '📁'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{space.name}</p>
        <p className="text-xs text-slate-500">
          {projectCount} projeto{projectCount !== 1 ? 's' : ''}
        </p>
      </div>
      <ChevronRight
        size={15}
        className="text-slate-600 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0"
      />
    </Link>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
interface DashboardPageClientProps {
  stats: Stats
  myTasks: Task[]
  activityLogs: ActivityLog[]
  spaces: (Space & { projects?: Project[] })[]
  workspaceSlug: string
  userName: string
}

export default function DashboardPageClient({
  stats,
  myTasks,
  activityLogs,
  spaces,
  workspaceSlug,
  userName,
}: DashboardPageClientProps) {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return (
    <div className="min-h-full bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-8">
        {/* Welcome header */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Aqui está um resumo das suas atividades.
          </p>
        </div>

        {/* Stats */}
        <DashboardStats stats={stats} />

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left column – My tasks + activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* My Tasks */}
            <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-orange-400" />
                  <h2 className="text-sm font-semibold text-white">Minhas Tarefas</h2>
                </div>
                {myTasks.length > 0 && (
                  <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
                    {myTasks.length}
                  </span>
                )}
              </div>

              {myTasks.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <CheckCircle2 size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-500">Nenhuma tarefa atribuída a você.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myTasks.map((task) => (
                    <TaskRow key={task.id} task={task as Task & { list?: { project?: { space?: { id: string }; id: string }; id: string } }} workspaceSlug={workspaceSlug} />
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-6">
              <div className="flex items-center gap-2 mb-5">
                <Activity size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-white">Atividade Recente</h2>
              </div>

              {activityLogs.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <Activity size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-500">Nenhuma atividade registrada ainda.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <ActivityItem key={log.id} log={log} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column – Spaces overview */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderOpen size={16} className="text-slate-400" />
                  <h2 className="text-sm font-semibold text-white">Projetos</h2>
                </div>
                <Link
                  href={`/${workspaceSlug}/spaces`}
                  className="text-xs text-slate-500 hover:text-orange-400 transition-colors"
                >
                  Ver todos
                </Link>
              </div>

              {spaces.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-8 text-center">
                  <FolderOpen size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-500">Nenhum espaço criado.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {spaces.map((space) => (
                    <SpaceCard
                      key={space.id}
                      space={space}
                      workspaceSlug={workspaceSlug}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl border border-white/10 bg-[#1E293B] p-6">
              <h2 className="text-sm font-semibold text-white mb-4">Resumo</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Circle size={12} className="text-blue-400" />
                    Tarefas Abertas
                  </span>
                  <span className="font-semibold text-white">{stats.open}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Clock size={12} className="text-orange-400" />
                    Em Andamento
                  </span>
                  <span className="font-semibold text-white">{stats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <CheckCircle2 size={12} className="text-green-400" />
                    Concluídas Hoje
                  </span>
                  <span className="font-semibold text-white">{stats.completedToday}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-400">
                    <AlertCircle size={12} className="text-red-400" />
                    Atrasadas
                  </span>
                  <span className={cn('font-semibold', stats.overdue > 0 ? 'text-red-400' : 'text-white')}>
                    {stats.overdue}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
