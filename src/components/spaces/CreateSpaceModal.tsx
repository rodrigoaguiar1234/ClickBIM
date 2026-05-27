'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { useCreateSpace } from '@/src/lib/mutations/workspaces'
import { cn } from '@/src/lib/utils/cn'

const PRESET_COLORS = [
  '#F97316', // orange
  '#EF4444', // red
  '#8B5CF6', // violet
  '#3B82F6', // blue
  '#06B6D4', // cyan
  '#22C55E', // green
  '#EAB308', // yellow
  '#EC4899', // pink
]

const PRESET_ICONS = ['📁', '🏗️', '⚡', '🔧', '🏢', '💡', '📊', '🎯', '🚀', '💎', '🔑', '📌']

interface CreateSpaceModalProps {
  workspaceId: string
  userId: string
  onClose: () => void
  onSuccess?: () => void
}

export default function CreateSpaceModal({
  workspaceId,
  userId,
  onClose,
  onSuccess,
}: CreateSpaceModalProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [icon, setIcon] = useState(PRESET_ICONS[0])
  const [error, setError] = useState<string | null>(null)

  const createSpace = useCreateSpace()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('O nome do espaço é obrigatório.')
      return
    }

    try {
      await createSpace.mutateAsync({ workspaceId, name: name.trim(), color, icon, userId })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar espaço.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-space-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 id="create-space-title" className="text-lg font-semibold text-white">
            Novo Espaço
          </h2>
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
              Nome do Espaço
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Marketing, Engenharia..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Ícone
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'flex h-10 w-full items-center justify-center rounded-lg text-xl transition-all',
                    icon === emoji
                      ? 'bg-orange-500/20 ring-2 ring-orange-500'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              Cor
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    'h-8 w-8 rounded-full transition-all',
                    color === c ? 'ring-2 ring-offset-2 ring-offset-[#1E293B] ring-white scale-110' : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg text-lg"
              style={{ backgroundColor: color + '33' }}
            >
              {icon}
            </span>
            <span className="text-sm font-medium text-white">
              {name || 'Nome do Espaço'}
            </span>
          </div>

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
              disabled={createSpace.isPending}
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
            >
              {createSpace.isPending && <Loader2 size={14} className="animate-spin" />}
              Criar Espaço
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
