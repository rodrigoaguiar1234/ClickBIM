'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, List, GanttChart, Calendar } from 'lucide-react'
import { cn } from '@/src/lib/utils/cn'

interface ViewSwitcherProps {
  basePath: string
}

const VIEWS = [
  { key: 'board', label: 'Board', href: 'board', Icon: LayoutDashboard },
  { key: 'list', label: 'List', href: '', Icon: List },
  { key: 'gantt', label: 'Gantt', href: 'gantt', Icon: GanttChart },
  { key: 'calendar', label: 'Calendar', href: 'calendar', Icon: Calendar },
] as const

export function ViewSwitcher({ basePath }: ViewSwitcherProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    const fullPath = href ? `${basePath}/${href}` : basePath
    // Exact match for the list (default) view, starts-with for nested views
    if (href === '') {
      return pathname === basePath || pathname === `${basePath}/`
    }
    return pathname.startsWith(fullPath)
  }

  return (
    <nav
      className="flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4"
      aria-label="View switcher"
    >
      {VIEWS.map(({ key, label, href, Icon }) => {
        const active = isActive(href)
        const fullHref = href ? `${basePath}/${href}` : basePath
        return (
          <Link
            key={key}
            href={fullHref}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors',
              '-mb-px', // overlap the container border
              active
                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            aria-current={active ? 'page' : undefined}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
