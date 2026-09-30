'use client'

import { cn } from '@/lib/utils'

export function Tabs({ tabs, activa, onChange }: { tabs: { id: string; label: string }[]; activa: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-line px-4 md:px-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            'shrink-0 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors',
            activa === t.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-muted hover:text-ink'
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}
