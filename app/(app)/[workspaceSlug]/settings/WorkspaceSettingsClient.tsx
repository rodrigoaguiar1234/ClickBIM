'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Trash2, AlertTriangle, Settings, Shield } from 'lucide-react'
import { useUpdateWorkspace } from '@/src/lib/mutations/workspaces'
import { createClient } from '@/src/lib/supabase/client'
import { cn } from '@/src/lib/utils/cn'
import type { Workspace } from '@/src/types'

interface WorkspaceSettingsClientProps {
  workspace: Workspace
  isOwner: boolean
  userId: string
}

function Section({
  title,
  description,
  children,
  icon,
  danger,
}: {
  title: string
  description?: string
  children: React.ReactNode
  icon?: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-6',
        danger
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/10 bg-[#1E293B]'
      )}
    >
      <div className="flex items-center gap-3 mb-1">
        {icon && (
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-lg',
              danger ? 'bg-red-500/15 text-red-400' : 'bg-orange-500/15 text-orange-400'
            )}
          >
            {icon}
          </span>
        )}
        <h2
          className={cn(
            'text-base font-semibold',
            danger ? 'text-red-400' : 'text-white'
          )}
        >
          {title}
        </h2>
      </div>
      {description && (
        <p className="text-sm text-slate-500 mb-5 ml-11">{description}</p>
      )}
      <div className={cn(!description && 'mt-4')}>{children}</div>
    </div>
  )
}

export default function WorkspaceSettingsClient({
  workspace,
  isOwner,
  userId,
}: WorkspaceSettingsClientProps) {
  const router = useRouter()
  const [name, setName] = useState(workspace.name)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateWorkspace = useUpdateWorkspace()

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveError(null)
    setSaveSuccess(false)

    if (!name.trim()) {
      setSaveError('O nome não pode ficar vazio.')
      return
    }

    try {
      await updateWorkspace.mutateAsync({ workspaceId: workspace.id, name: name.trim() })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      router.refresh()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar.')
    }
  }

  async function handleDelete() {
    if (deleteConfirm !== workspace.name) {
      setDeleteError(`Digite exatamente "${workspace.name}" para confirmar.`)
      return
    }

    setDeleting(true)
    setDeleteError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspace.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir workspace.')
      setDeleting(false)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center gap-3">
          <Settings size={20} className="text-slate-400" />
          <div>
            <h1 className="text-xl font-bold text-white">Configurações do Workspace</h1>
            <p className="text-xs text-slate-500">{workspace.name}</p>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl px-6 py-8 space-y-6">
        {/* General settings */}
        <Section
          title="Geral"
          description="Informações básicas do workspace."
          icon={<Settings size={16} />}
        >
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Nome do Workspace
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Slug (URL)
              </label>
              <div className="flex items-center gap-0">
                <span className="rounded-l-lg border border-r-0 border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-500 select-none">
                  clickbim.app/
                </span>
                <div className="flex-1 rounded-r-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-slate-400 cursor-not-allowed select-none">
                  {workspace.slug}
                </div>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                O slug não pode ser alterado após a criação.
              </p>
            </div>

            {saveError && (
              <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                {saveError}
              </p>
            )}

            {saveSuccess && (
              <p className="rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-400">
                Alterações salvas com sucesso!
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={updateWorkspace.isPending || name.trim() === workspace.name}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {updateWorkspace.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Salvar Alterações
              </button>
            </div>
          </form>
        </Section>

        {/* Permissions info */}
        <Section
          title="Permissões"
          description="Informações sobre seu nível de acesso."
          icon={<Shield size={16} />}
        >
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold uppercase">
              {isOwner ? 'O' : 'A'}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {isOwner ? 'Proprietário' : 'Administrador'}
              </p>
              <p className="text-xs text-slate-500">
                {isOwner
                  ? 'Você tem controle total sobre este workspace.'
                  : 'Você pode gerenciar membros e configurações.'}
              </p>
            </div>
          </div>
        </Section>

        {/* Danger zone */}
        {isOwner && (
          <Section
            title="Zona de Perigo"
            description="Ações irreversíveis. Tenha cuidado."
            icon={<AlertTriangle size={16} />}
            danger
          >
            <div className="space-y-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <p className="text-sm font-semibold text-red-400">Excluir Workspace</p>
                <p className="mt-1 text-sm text-slate-500">
                  Esta ação irá excluir permanentemente o workspace{' '}
                  <strong className="text-slate-300">"{workspace.name}"</strong>, incluindo todos os
                  espaços, projetos, listas e tarefas. Esta ação não pode ser desfeita.
                </p>

                <div className="mt-4 space-y-3">
                  <label className="block text-sm text-slate-400">
                    Para confirmar, digite <strong className="text-slate-200">{workspace.name}</strong>:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder={workspace.name}
                    className="w-full rounded-lg border border-red-500/30 bg-red-500/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                  />

                  {deleteError && (
                    <p className="text-sm text-red-400">{deleteError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || deleteConfirm !== workspace.name}
                    className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deleting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                    Excluir Workspace Permanentemente
                  </button>
                </div>
              </div>
            </div>
          </Section>
        )}
      </main>
    </div>
  )
}
