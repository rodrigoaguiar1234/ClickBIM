'use client'

import { useState } from 'react'
import { X, Loader2, Calendar } from 'lucide-react'
import { useCreateProject } from '@/src/lib/mutations/workspaces'
import { cn } from '@/src/lib/utils/cn'

const PRESET_COLORS = [
  '#6366F1', // indigo
  '#F97316', // orange
  '#EF4444', // red
  '#8B5CF6', // violet
  '#3B82F6', // blue
  '#22C55E', // green
  '#EAB308', // yellow
  '#EC4899', // pink
]

interface CreateProjectModalProps {
  spaceId: string
  userId: string
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateProjectModal({
  spaceId,
  userId,
  onClose,
  onSuccess,
}: CreateProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createProject = useCreateProject()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome do projeto é obrigatório.')
      return
    }

    try {
      await createProject.mutateAsync({
        spaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        color,
        dueDate: dueDate || undefined,
        userId,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar projeto.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-lg rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-project-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              P
            </span>
            <h2 id="create-project-title" className="text-lg font-semibold text-white">
              Novo Projeto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Nome do Projeto <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Site Institucional, App Mobile..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o objetivo deste projeto..."
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Color + Due Date row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Cor</label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      'h-7 w-7 rounded-full transition-all',
                      color === c
                        ? 'ring-2 ring-offset-2 ring-offset-[#1E293B] ring-white scale-110'
                        : 'hover:scale-110'
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Cor ${c}`}
                  />
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Data Limite
                </span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          {/* Info note */}
          <p className="text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-2">
            Uma lista padrão chamada <strong className="text-slate-400">"Tarefas"</strong> será criada automaticamente.
          </p>

          {error && (
            <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={createProject.isPending}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {createProject.isPending && <Loader2 size={14} className="animate-spin" />}
              Criar Projeto
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
