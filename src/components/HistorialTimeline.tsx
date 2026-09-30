import type { EventoHistorial } from '@/types'
import { personaPorId } from '@/data/equipo'
import { formatDate } from '@/lib/format'
import { Phone, Mail, Users as UsersIcon, StickyNote, Settings2 } from 'lucide-react'

const ICONOS: Record<EventoHistorial['tipo'], React.ComponentType<{ size?: number; className?: string }>> = {
  llamada: Phone,
  mail: Mail,
  reunion: UsersIcon,
  nota: StickyNote,
  sistema: Settings2,
}

export function HistorialTimeline({ eventos }: { eventos: EventoHistorial[] }) {
  const ordenados = [...eventos].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
  if (ordenados.length === 0) return <p className="text-sm text-muted">Sin eventos todavía.</p>

  return (
    <ul className="flex flex-col gap-4">
      {ordenados.map((ev) => {
        const Icon = ICONOS[ev.tipo]
        const autor = personaPorId(ev.autorId)
        return (
          <li key={ev.id} className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper text-muted">
              <Icon size={14} />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm text-ink">{ev.descripcion}</p>
              <p className="text-xs text-muted">
                {formatDate(ev.fecha)} · {autor?.nombre ?? 'Sistema'}
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
