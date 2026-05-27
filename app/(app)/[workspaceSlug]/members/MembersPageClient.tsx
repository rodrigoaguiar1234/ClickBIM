'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  Users,
  UserPlus,
  MoreHorizontal,
  Trash2,
  Shield,
  Loader2,
  ChevronDown,
} from 'lucide-react'
import { createClient } from '@/src/lib/supabase/client'
import InviteMemberModal from '@/src/components/members/InviteMemberModal'
import { cn } from '@/src/lib/utils/cn'
import type { Workspace, WorkspaceMember, WorkspaceRole } from '@/src/types'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const ROLE_LABELS: Record<WorkspaceRole, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<WorkspaceRole, string> = {
  owner: 'text-orange-400 bg-orange-500/15',
  admin: 'text-purple-400 bg-purple-500/15',
  member: 'text-blue-400 bg-blue-500/15',
  viewer: 'text-slate-400 bg-slate-500/15',
}

interface AvatarProps {
  name?: string | null
  avatarUrl?: string | null
  size?: number
}

function Avatar({ name, avatarUrl, size = 36 }: AvatarProps) {
  const initials = name
    ? name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : '?'

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name ?? 'Avatar'}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 font-semibold text-white text-xs"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  )
}

interface RoleDropdownProps {
  currentRole: WorkspaceRole
  memberId: string
  targetUserId: string
  isOwner: boolean
  disabled?: boolean
  onChanged: () => void
}

function RoleDropdown({
  currentRole,
  memberId,
  targetUserId,
  isOwner,
  disabled,
  onChanged,
}: RoleDropdownProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const changeable: WorkspaceRole[] = isOwner
    ? ['admin', 'member', 'viewer']
    : ['member', 'viewer']

  async function handleChange(role: WorkspaceRole) {
    setOpen(false)
    if (role === currentRole) return
    setLoading(true)
    try {
      await supabase
        .from('workspace_members')
        .update({ role })
        .eq('id', memberId)
      onChanged()
    } finally {
      setLoading(false)
    }
  }

  if (disabled || currentRole === 'owner') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
          ROLE_COLORS[currentRole]
        )}
      >
        {currentRole === 'owner' && <Shield size={10} />}
        {ROLE_LABELS[currentRole]}
      </span>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
          ROLE_COLORS[currentRole],
          'hover:opacity-80'
        )}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : null}
        {ROLE_LABELS[currentRole]}
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#1E293B] shadow-xl">
            {changeable.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleChange(role)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-xs text-left transition-colors',
                  role === currentRole
                    ? 'bg-white/5 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                )}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface MembersPageClientProps {
  workspace: Workspace
  members: WorkspaceMember[]
  currentUserId: string
  canManage: boolean
}

export default function MembersPageClient({
  workspace,
  members,
  currentUserId,
  canManage,
}: MembersPageClientProps) {
  const router = useRouter()
  const [showInvite, setShowInvite] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null)
  const supabase = createClient()

  const currentMember = members.find((m) => m.user_id === currentUserId)
  const isOwner = currentMember?.role === 'owner'

  async function handleRemove(member: WorkspaceMember) {
    if (member.role === 'owner') return
    setRemovingId(member.id)
    try {
      await supabase.from('workspace_members').delete().eq('id', member.id)
      router.refresh()
    } finally {
      setRemovingId(null)
      setConfirmRemoveId(null)
    }
  }

  return (
    <div className="flex flex-col min-h-full bg-[#0F172A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0F172A]/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users size={20} className="text-slate-400" />
            <div>
              <h1 className="text-xl font-bold text-white">Membros</h1>
              <p className="text-xs text-slate-500">
                {members.length} membro{members.length !== 1 ? 's' : ''} em {workspace.name}
              </p>
            </div>
          </div>

          {canManage && (
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <UserPlus size={16} />
              Convidar
            </button>
          )}
        </div>
      </div>

      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        {/* Table */}
        <div className="rounded-2xl border border-white/10 bg-[#1E293B] overflow-hidden">
          {/* Table header */}
          <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto] gap-4 border-b border-white/10 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600">
            <span className="w-9" />
            <span>Nome</span>
            <span>E-mail</span>
            <span>Função</span>
            <span>Entrou em</span>
          </div>

          {/* Rows */}
          {members.map((member, idx) => {
            const profile = member.user as unknown as {
              id: string
              email: string
              full_name?: string
              avatar_url?: string
            } | null
            const isMe = member.user_id === currentUserId
            const canRemoveThis =
              canManage &&
              !isMe &&
              member.role !== 'owner' &&
              (isOwner || member.role !== 'admin')

            return (
              <div
                key={member.id}
                className={cn(
                  'flex flex-col md:grid md:grid-cols-[auto_1fr_1fr_auto_auto] items-start md:items-center gap-3 md:gap-4 px-6 py-4 transition-colors',
                  idx !== members.length - 1 && 'border-b border-white/5',
                  isMe && 'bg-orange-500/5'
                )}
              >
                {/* Avatar */}
                <div className="shrink-0">
                  <Avatar
                    name={profile?.full_name ?? profile?.email}
                    avatarUrl={profile?.avatar_url}
                  />
                </div>

                {/* Name */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-white truncate">
                    {profile?.full_name ?? 'Sem nome'}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-xs text-orange-400 shrink-0">
                      Você
                    </span>
                  )}
                </div>

                {/* Email */}
                <span className="text-sm text-slate-500 truncate">
                  {profile?.email ?? '—'}
                </span>

                {/* Role */}
                <RoleDropdown
                  currentRole={member.role as WorkspaceRole}
                  memberId={member.id}
                  targetUserId={member.user_id}
                  isOwner={isOwner}
                  disabled={!canManage || isMe || member.role === 'owner'}
                  onChanged={() => router.refresh()}
                />

                {/* Joined + actions */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-600 whitespace-nowrap">
                    {format(new Date(member.joined_at), "dd MMM 'de' yyyy", {
                      locale: ptBR,
                    })}
                  </span>

                  {canRemoveThis && (
                    <>
                      {confirmRemoveId === member.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Remover?</span>
                          <button
                            type="button"
                            onClick={() => handleRemove(member)}
                            disabled={removingId === member.id}
                            className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                          >
                            {removingId === member.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              'Sim'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmRemoveId(null)}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmRemoveId(member.id)}
                          className="flex items-center justify-center h-7 w-7 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Remover membro"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {showInvite && (
        <InviteMemberModal
          workspaceId={workspace.id}
          workspaceSlug={workspace.slug}
          onClose={() => setShowInvite(false)}
        />
      )}
    </div>
  )
}
