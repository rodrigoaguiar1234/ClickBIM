import {
  CheckSquare,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Activity,
  ArrowUpRight,
} from 'lucide-react'

const statCards = [
  {
    label: 'Tarefas Abertas',
    value: '—',
    icon: CheckSquare,
    iconColor: '#3B82F6',
    iconBg: 'rgba(59,130,246,0.12)',
    trend: null,
  },
  {
    label: 'Em Progresso',
    value: '—',
    icon: Clock,
    iconColor: '#F97316',
    iconBg: 'rgba(249,115,22,0.12)',
    trend: null,
  },
  {
    label: 'Concluídas hoje',
    value: '—',
    icon: CheckCircle2,
    iconColor: '#10B981',
    iconBg: 'rgba(16,185,129,0.12)',
    trend: null,
  },
  {
    label: 'Atrasadas',
    value: '—',
    icon: AlertTriangle,
    iconColor: '#EF4444',
    iconBg: 'rgba(239,68,68,0.12)',
    trend: null,
  },
]

const recentActivity = [
  {
    id: 1,
    action: 'Tarefa criada',
    description: 'Modelagem Revit – Torre A',
    time: 'há 2 horas',
    dot: '#3B82F6',
  },
  {
    id: 2,
    action: 'Status atualizado',
    description: 'Revisão IFC – Bloco B → Em Progresso',
    time: 'há 4 horas',
    dot: '#F97316',
  },
  {
    id: 3,
    action: 'Tarefa concluída',
    description: 'Relatório de Incompatibilidades',
    time: 'ontem',
    dot: '#10B981',
  },
  {
    id: 4,
    action: 'Comentário adicionado',
    description: 'Projeto Subestação – "Aprovado pela diretoria"',
    time: 'ontem',
    dot: '#8B5CF6',
  },
]

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Bem-vindo ao ClickBIM 👋
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Aqui está um resumo das suas atividades de hoje.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="rounded-2xl p-5 transition-all hover:scale-[1.01]"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-start justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: iconBg }}
              >
                <Icon className="w-5 h-5" style={{ color: iconColor }} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-600" />
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-sm text-slate-400 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom section: Recent activity + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div
          className="lg:col-span-2 rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Activity className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-200">Atividade Recente</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <div
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: item.dot }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{item.action}</p>
                  <p className="text-xs text-slate-500 truncate">{item.description}</p>
                </div>
                <span className="text-xs text-slate-600 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>

          <button
            className="mt-5 w-full rounded-lg py-2 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.07)' }}
          >
            Ver toda a atividade
          </button>
        </div>

        {/* Quick actions */}
        <div
          className="rounded-2xl p-6"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <h2 className="text-sm font-semibold text-slate-200 mb-5">Ações Rápidas</h2>
          <div className="space-y-2">
            {[
              { label: 'Nova Tarefa', color: '#F97316' },
              { label: 'Novo Projeto', color: '#3B82F6' },
              { label: 'Novo Espaço', color: '#10B981' },
              { label: 'Convidar Membro', color: '#8B5CF6' },
            ].map(({ label, color }) => (
              <button
                key={label}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-all hover:bg-white/5"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
