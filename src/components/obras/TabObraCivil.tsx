'use client'

import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TabObraCivil({ obra }: { obra: Obra }) {
  const toggle = useStore((s) => s.toggleObraCivil)
  const listos = obra.obraCivil.filter((i) => i.listo).length

  return (
    <div className="p-4 md:p-6">
      <p className="mb-3 text-sm text-muted">
        Checklist de lo que la constructora tiene que dejar listo antes del montaje. {listos}/{obra.obraCivil.length} listos.
      </p>
      <div className="space-y-2">
        {obra.obraCivil.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(obra.id, item.id)}
            className="flex w-full items-center gap-3 rounded-card border border-line bg-white p-3.5 text-left transition-colors hover:bg-paper"
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2',
                item.listo ? 'border-success bg-success' : 'border-line bg-white'
              )}
            >
              {item.listo && <Check size={14} className="text-white" strokeWidth={3} />}
            </span>
            <span className={cn('text-sm font-medium', item.listo ? 'text-ink' : 'text-muted')}>{item.nombre}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
