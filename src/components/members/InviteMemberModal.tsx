'use client'

import { useState } from 'react'
import { X, Loader2, Mail, CheckCircle2, Copy, Check } from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import { cn } from '@/src/lib/utils/cn'

type InviteRole = 'member' | 'viewer'

interface InviteMemberModalProps {
  workspaceId: string
  workspaceSlug: string
  onClose: () => void
}

export default function InviteMemberModal({
  workspaceId,
  workspaceSlug,
  onClose,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<InviteRole>('member')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState(false)

  const inviteLink =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join/${workspaceSlug}`
      : `/join/${workspaceSlug}`

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setError('Insira um endereço de e-mail válido.')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()

      // Insert a pending invite record
      const { error: invErr } = await supabase.from('workspace_invites').insert({
        workspace_id: workspaceId,
        email: email.trim().toLowerCase(),
        role,
      })

      if (invErr) {
        if (invErr.code === '23505') {
          setError('Este e-mail já foi convidado para este workspace.')
        } else {
          throw invErr
        }
        setLoading(false)
        return
      }

      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar convite.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback silently
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#1E293B] border border-white/10 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
          <h2 id="invite-member-title" className="text-lg font-semibold text-white">
            Convidar Membro
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {success ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <CheckCircle2 size={48} className="text-green-400" />
              <div>
                <p className="text-white font-semibold text-base">Convite enviado!</p>
                <p className="text-slate-400 text-sm mt-1">
                  Um convite foi registrado para{' '}
                  <strong className="text-slate-300">{email}</strong>.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-2 rounded-lg bg-orange-500 px-6 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <form onSubmit={handleInvite} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  E-mail
                </label>
                <div className="relative">
                  <Mail
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colega@empresa.com"
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Função
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { value: 'member', label: 'Membro', desc: 'Pode criar e editar' },
                      { value: 'viewer', label: 'Visualizador', desc: 'Somente leitura' },
                    ] as const
                  ).map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={cn(
                        'flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all',
                        role === r.value
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      )}
                    >
                      <span className="text-sm font-medium text-white">{r.label}</span>
                      <span className="text-xs text-slate-500">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                Enviar Convite
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#1E293B] px-3 text-xs text-slate-500">ou compartilhe o link</span>
            </div>
          </div>

          {/* Copy link */}
          <div className="flex items-center gap-2">
            <div className="flex-1 truncate rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-400">
              {inviteLink}
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 transition-colors shrink-0"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-green-400" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copiar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
