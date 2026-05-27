'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Bell,
  Search,
  ChevronRight,
  LayoutGrid,
  List,
  BarChart2,
  Calendar,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react'
import { useWorkspaceStore } from '@/src/lib/store/workspaceStore'
import { createClient } from '@/src/lib/supabase/client'

const viewOptions = [
  { id: 'board' as const, label: 'Board', icon: LayoutGrid },
  { id: 'list' as const, label: 'Lista', icon: List },
  { id: 'gantt' as const, label: 'Gantt', icon: BarChart2 },
  { id: 'calendar' as const, label: 'Calendário', icon: Calendar },
]

interface BreadcrumbItem {
  label: string
  href?: string
}

function useBreadcrumbs(): BreadcrumbItem[] {
  const pathname = usePathname()
  const { activeWorkspaceSlug, activeSpaceId, activeProjectId, activeListId } = useWorkspaceStore()

  const crumbs: BreadcrumbItem[] = []

  if (pathname.startsWith('/dashboard')) {
    crumbs.push({ label: 'Dashboard' })
    return crumbs
  }
  if (pathname.startsWith('/tasks')) {
    crumbs.push({ label: 'Minhas Tarefas' })
    return crumbs
  }
  if (pathname.startsWith('/notifications')) {
    crumbs.push({ label: 'Notificações' })
    return crumbs
  }
  if (pathname.startsWith('/settings')) {
    crumbs.push({ label: 'Configurações' })
    return crumbs
  }

  if (activeWorkspaceSlug) {
    crumbs.push({ label: activeWorkspaceSlug, href: `/${activeWorkspaceSlug}` })
  }
  if (activeSpaceId) {
    crumbs.push({ label: 'Espaço', href: '#' })
  }
  if (activeProjectId) {
    crumbs.push({ label: 'Projeto', href: '#' })
  }
  if (activeListId) {
    crumbs.push({ label: 'Lista' })
  }

  if (crumbs.length === 0) {
    crumbs.push({ label: 'ClickBIM' })
  }

  return crumbs
}

function isTaskListPage(pathname: string) {
  return (
    pathname.includes('/spaces/') ||
    pathname.includes('/projects/') ||
    pathname.includes('/lists/')
  )
}

export default function TopBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { activeView, setActiveView } = useWorkspaceStore()
  const breadcrumbs = useBreadcrumbs()
  const showViewSwitcher = isTaskListPage(pathname)

  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="flex h-14 shrink-0 items-center justify-between px-4"
      style={{
        backgroundColor: '#0F172A',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-1.5 min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={index} className="flex items-center gap-1.5 min-w-0">
            {index > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-slate-600" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors truncate max-w-[160px]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="text-sm font-medium text-slate-200 truncate max-w-[160px]">
                {crumb.label}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Center: View switcher (only on task list pages) */}
      {showViewSwitcher && (
        <div
          className="flex items-center gap-0.5 rounded-lg p-0.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
        >
          {viewOptions.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: activeView === id ? 'rgba(249,115,22,0.15)' : 'transparent',
                color: activeView === id ? '#F97316' : '#94A3B8',
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Search button */}
        <button
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          onClick={() => {}}
          aria-label="Buscar"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:block text-xs text-slate-500">
            <kbd className="rounded px-1 py-0.5 text-[11px]" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}>
              ⌘K
            </kbd>
          </span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {/* Unread badge */}
            <span
              className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
              style={{ backgroundColor: '#F97316' }}
            />
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <span className="text-sm font-semibold text-white">Notificações</span>
                <button className="text-xs text-slate-400 hover:text-orange-400 transition-colors flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Marcar todas
                </button>
              </div>
              <div className="py-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Nenhuma notificação</p>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white transition-all hover:ring-2 hover:ring-orange-500/40"
            style={{ backgroundColor: '#F97316' }}
            aria-label="Menu do usuário"
          >
            U
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl py-1 shadow-xl z-50"
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
              <div
                className="px-3 py-2.5"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
              >
                <p className="text-xs font-medium text-slate-200 truncate">Usuário</p>
                <p className="text-[11px] text-slate-500 truncate">EnergiaBIM</p>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                Perfil
              </Link>
              <Link
                href="/settings"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setUserMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Configurações
              </Link>
              <div className="my-1" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
