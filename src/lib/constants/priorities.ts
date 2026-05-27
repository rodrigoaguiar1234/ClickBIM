export const PRIORITY_CONFIG = {
  urgent: {
    label: 'Urgente',
    color: '#EF4444',
    bgClass: 'bg-red-500/15 text-red-400',
    icon: 'AlertOctagon',
  },
  high: {
    label: 'Alta',
    color: '#F97316',
    bgClass: 'bg-orange-500/15 text-orange-400',
    icon: 'ArrowUp',
  },
  normal: {
    label: 'Normal',
    color: '#3B82F6',
    bgClass: 'bg-blue-500/15 text-blue-400',
    icon: 'Minus',
  },
  low: {
    label: 'Baixa',
    color: '#10B981',
    bgClass: 'bg-green-500/15 text-green-400',
    icon: 'ArrowDown',
  },
  none: {
    label: 'Nenhuma',
    color: '#6B7280',
    bgClass: 'bg-gray-500/15 text-gray-400',
    icon: 'Circle',
  },
} as const

export type Priority = keyof typeof PRIORITY_CONFIG
