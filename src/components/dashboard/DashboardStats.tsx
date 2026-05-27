'use client'

import { CheckCircle2, Clock, AlertCircle, Circle } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'
import type { DashboardStats } from '@/src/types'

interface StatCardProps {
  icon: React.ReactNode
  value: number
  label: string
  accent: string
  bgAccent: string
}

function StatCard({ icon, value, label, accent, bgAccent }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-[#1E293B] border border-white/10 p-5">
      {/* Accent glow */}
      <div
        className="absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl"
        style={{ backgroundColor: accent }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-white">{value.toLocaleString('pt-BR')}</p>
          <p className="mt-1 text-sm text-slate-400">{label}</p>
        </div>
        <span
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-xl',
          )}
          style={{ backgroundColor: bgAccent, color: accent }}
        >
          {icon}
        </span>
      </div>
    </div>
  )
}

interface DashboardStatsProps {
  stats: DashboardStats
  className?: string
}

export default function DashboardStats({ stats, className }: DashboardStatsProps) {
  const cards = [
    {
      icon: <Circle size={20} />,
      value: stats.open,
      label: 'Tarefas Abertas',
      accent: '#3B82F6',
      bgAccent: 'rgba(59,130,246,0.15)',
    },
    {
      icon: <Clock size={20} />,
      value: stats.inProgress,
      label: 'Em Andamento',
      accent: '#F97316',
      bgAccent: 'rgba(249,115,22,0.15)',
    },
    {
      icon: <CheckCircle2 size={20} />,
      value: stats.completedToday,
      label: 'Concluídas Hoje',
      accent: '#22C55E',
      bgAccent: 'rgba(34,197,94,0.15)',
    },
    {
      icon: <AlertCircle size={20} />,
      value: stats.overdue,
      label: 'Atrasadas',
      accent: '#EF4444',
      bgAccent: 'rgba(239,68,68,0.15)',
    },
  ]

  return (
    <div className={cn('grid grid-cols-2 gap-4 lg:grid-cols-4', className)}>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
