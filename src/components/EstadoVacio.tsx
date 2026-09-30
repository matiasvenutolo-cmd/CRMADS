import { Inbox } from 'lucide-react'

export function EstadoVacio({ titulo, descripcion }: { titulo: string; descripcion?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
      <Inbox size={28} className="text-muted" />
      <p className="font-medium text-ink">{titulo}</p>
      {descripcion && <p className="max-w-sm text-sm text-muted">{descripcion}</p>}
    </div>
  )
}

export function ProximaEtapa({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-line/60 px-3 py-1 text-xs font-medium text-muted">
      {label ?? 'Disponible en la próxima etapa'}
    </span>
  )
}
