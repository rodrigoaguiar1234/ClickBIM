'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  CheckSquare,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Zap,
  LogOut,
  User,
  Plus,
} from 'lucide-react'
import { useUIStore } from '@/src/lib/store/uiStore'
import { createClient } from '@/src/lib/supabase/client'

interface SpaceItem {
  id: string
  name: string
  color: string
  href: string
}

const spaces: SpaceItem[] = [
  { id: '1', name: 'Projetos BIM', color: '#3B82F6', href: '#' },
  { id: '2', name: 'Infraestrutura', color: '#10B981', href: '#' },
  { id: '3', name: 'Documentação', color: '#8B5CF6', href: '#' },
]

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Minhas Tarefas', href: '/tasks', icon: CheckSquare },
  { label: 'Notificações', href: '/notifications', icon: Bell },
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [expandedSpaces, setExpandedSpaces] = useState<Set<string>>(new Set(['1']))
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const toggleSpace = (id: string) => {
    setExpandedSpaces((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside
      className="relative flex flex-col h-screen shrink-0 transition-all duration-300 ease-in-out"
      style={{
        width: sidebarCollapsed ? '64px' : '240px',
        backgroundColor: '#0F172A',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 z-10 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:text-white transition-colors shadow-lg"
        style={{
          backgroundColor: '#1E293B',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
        aria-label={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Logo */}
      <div
        className="flex items-center gap-3 px-4 py-5"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: '#F97316' }}
        >
          <Zap className="w-5 h-5 text-white" fill="white" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white leading-tight">ClickBIM</p>
            <p className="text-xs text-slate-400 leading-tight">EnergiaBIM</p>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {/* Main nav */}
        <nav className="px-2 space-y-0.5">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                className="group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-all"
                style={{
                  color: active ? '#F97316' : '#94A3B8',
                  backgroundColor: active ? 'rgba(249,115,22,0.15)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    e.currentTarget.style.color = '#E2E8F0'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = '#94A3B8'
                  }
                }}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4.5 h-4.5 shrink-0 w-[18px] h-[18px]" />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Workspace section */}
        {!sidebarCollapsed && (
          <div className="mt-5 px-2">
            <div className="flex items-center justify-between px-2.5 mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Meu Workspace
              </span>
              <button
                className="flex h-5 w-5 items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
                aria-label="Novo espaço"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-0.5">
              {spaces.map((space) => (
                <div key={space.id}>
                  <div
                    className="group flex items-center gap-2 rounded-lg px-2.5 py-1.5 cursor-pointer transition-colors"
                    style={{ color: '#94A3B8' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                      e.currentTarget.style.color = '#E2E8F0'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#94A3B8'
                    }}
                    onClick={() => toggleSpace(space.id)}
                  >
                    <div
                      className="w-2 h-2 shrink-0 rounded-full"
                      style={{ backgroundColor: space.color }}
                    />
                    <span className="flex-1 truncate text-sm">{space.name}</span>
                    <ChevronDown
                      className="w-3.5 h-3.5 shrink-0 transition-transform"
                      style={{
                        transform: expandedSpaces.has(space.id)
                          ? 'rotate(0deg)'
                          : 'rotate(-90deg)',
                      }}
                    />
                  </div>

                  {expandedSpaces.has(space.id) && (
                    <div className="ml-4 mt-0.5 pl-2 space-y-0.5" style={{ borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
                      <Link
                        href={space.href}
                        className="block rounded-md px-2.5 py-1 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors truncate"
                      >
                        Todas as tarefas
                      </Link>
                      <Link
                        href={space.href}
                        className="block rounded-md px-2.5 py-1 text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors truncate"
                      >
                        Em progresso
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collapsed spaces dots */}
        {sidebarCollapsed && (
          <div className="mt-5 px-2 space-y-2">
            {spaces.map((space) => (
              <div
                key={space.id}
                className="flex justify-center"
                title={space.name}
              >
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: space.color }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom section */}
      <div
        className="mt-auto px-2 py-3 space-y-0.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Settings */}
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
          title={sidebarCollapsed ? 'Configurações' : undefined}
        >
          <Settings className="w-[18px] h-[18px] shrink-0" />
          {!sidebarCollapsed && <span>Configurações</span>}
        </Link>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            title={sidebarCollapsed ? 'Conta' : undefined}
          >
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: '#F97316' }}
            >
              U
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-xs font-medium text-slate-200 truncate">Usuário</p>
                <p className="text-[11px] text-slate-500 truncate">EnergiaBIM</p>
              </div>
            )}
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div
              className="absolute bottom-full left-0 mb-1 w-48 rounded-xl py-1 shadow-xl z-50"
              style={{
                backgroundColor: '#1E293B',
                border: '1px solid rgba(255,255,255,0.10)',
              }}
            >
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
    </aside>
  )
}
