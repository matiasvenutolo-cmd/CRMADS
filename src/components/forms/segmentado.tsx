'use client'

import { cn } from '@/lib/utils'

export function Segmentado<T extends string>({ opciones, valor, onChange, className, etiqueta }: { opciones: { valor: T; label: string }[]; valor: T; onChange: (v: T) => void; className?: string; etiqueta?: string }) {
  return (
    <div role="radiogroup" aria-label={etiqueta} className={cn('inline-flex rounded-control border border-line-strong bg-subtle p-0.5', className)}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onChange(o.valor)}
          className={cn(
            'h-8 flex-1 cursor-pointer whitespace-nowrap rounded-[8px] px-3 text-[13px] font-medium transition-all duration-150',
            valor === o.valor ? 'bg-surface text-ink shadow-[0_1px_2px_rgb(21_23_26/0.1),0_0_0_1px_rgb(21_23_26/0.06)]' : 'text-ink-3 hover:text-ink'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Chips para elegir una fecha relativa (mañana, en 1 semana…) o una fecha puntual. */
export function ElegirFecha({ valor, onChange, hoy, opciones, permitirVacio = true }: { valor: string | null; onChange: (v: string | null) => void; hoy: string; opciones: { dias: number; label: string }[]; permitirVacio?: boolean }) {
  const sumar = (d: number) => {
    const f = new Date(`${hoy}T12:00:00Z`)
    f.setUTCDate(f.getUTCDate() + d)
    return f.toISOString().slice(0, 10)
  }
  const presets = opciones.map((o) => ({ ...o, fecha: sumar(o.dias) }))
  const esPreset = presets.some((p) => p.fecha === valor)

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {permitirVacio && <Chip on={valor === null} onClick={() => onChange(null)}>Sin fecha</Chip>}
      {presets.map((p) => (
        <Chip key={p.dias} on={valor === p.fecha} onClick={() => onChange(p.fecha)}>
          {p.label}
        </Chip>
      ))}
      <label className={cn('relative inline-flex h-8 cursor-pointer items-center rounded-full border px-3 text-[13px] font-medium transition-colors', valor && !esPreset ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink-2 hover:border-ink/30')}>
        {valor && !esPreset ? new Date(`${valor}T12:00:00Z`).toLocaleDateString('es-AR', { timeZone: 'UTC', day: 'numeric', month: 'short' }) : 'Otra fecha'}
        <input type="date" value={valor ?? ''} min={hoy} onChange={(e) => onChange(e.target.value || null)} className="absolute inset-0 cursor-pointer opacity-0" aria-label="Elegir fecha" />
      </label>
    </div>
  )
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn('h-8 cursor-pointer rounded-full border px-3 text-[13px] font-medium transition-colors', on ? 'border-ink bg-ink text-white' : 'border-line-strong text-ink-2 hover:border-ink/30 hover:text-ink')}
    >
      {children}
    </button>
  )
}
