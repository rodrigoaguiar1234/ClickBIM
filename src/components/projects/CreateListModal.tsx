'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCreateList } from '@/src/lib/mutations/workspaces'
import { cn } from '@/src/lib/utils/cn'

const PRESET_COLORS = [
  '#6366F1',
  '#F97316',
  '#EF4444',
  '#8B5CF6',
  '#3B82F6',
  '#22C55E',
  '#EAB308',
  '#EC4899',
  '#14B8A6',
  '#F59E0B',
]

interface CreateListModalProps {
  projectId: string
  userId: string
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateListModal({
  projectId,
  userId,
  onClose,
  onSuccess,
}: CreateListModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const createList = useCreateList()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome da lista é obrigatório.')
      return
    }

    try {
      await createList.mutateAsync({
        projectId,
        name: name.trim(),
        color: color || undefined,
        userId,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar lista.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-list-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span
              className="flex h-4 w-4 rounded-sm"
              style={{ backgroundColor: color || '#6366F1' }}
            />
            <h2 id="create-list-title" className="text-lg font-semibold text-white">
              Nova Lista
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
              Nome da Lista <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Backlog, Sprint 1, Em Revisão..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Cor <span className="text-slate-500 text-xs">(opcional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {/* No color option */}
              <button
                type="button"
                onClick={() => setColor('')}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all bg-slate-700',
                  color === ''
                    ? 'border-white scale-110'
                    : 'border-transparent hover:scale-110'
                )}
                aria-label="Sem cor"
              >
                <span className="sr-only">Nenhuma</span>
              </button>

              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
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

          {/* Note about statuses */}
          <p className="text-xs text-slate-500 bg-white/5 rounded-lg px-3 py-2">
            Os status padrão <strong className="text-slate-400">A Fazer</strong>,{' '}
            <strong className="text-slate-400">Em Andamento</strong> e{' '}
            <strong className="text-slate-400">Concluído</strong> serão criados automaticamente.
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
              disabled={createList.isPending}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {createList.isPending && <Loader2 size={14} className="animate-spin" />}
              Criar Lista
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
