import Link from 'next/link'
import type { Obra } from '@/types'
import { clientePorId } from '@/data/clientes'
import { personaPorId } from '@/data/equipo'
import { formatDate } from '@/lib/format'
import { etapaActual, progresoObra, obraAtrasada } from '@/lib/obraHelpers'
import { Badge } from '@/components/ui/Badge'

export function ObraCard({ obra }: { obra: Obra }) {
  const cliente = clientePorId(obra.clienteId)
  const responsable = personaPorId(obra.responsableId)
  const progreso = progresoObra(obra)
  const atrasada = obraAtrasada(obra)
  const actual = etapaActual(obra)

  return (
    <Link href={`/obras/${obra.id}`} className="block rounded-card border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted">{obra.numero}</p>
          <p className="truncate font-medium text-ink">{cliente?.nombre}</p>
        </div>
        {atrasada && <Badge tone="danger">Atrasada</Badge>}
      </div>
      <p className="mt-1 truncate text-xs text-muted">{obra.datosTecnicos.direccion}</p>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted">{actual?.nombre}</span>
          <span className="font-medium text-ink">{progreso}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
          <div className={`h-full rounded-full ${atrasada ? 'bg-danger' : 'bg-brand-blue'}`} style={{ width: `${progreso}%` }} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
        <span>{responsable?.nombre}</span>
        <span>Puesta en marcha: {formatDate(obra.fechaEstimadaPuestaEnMarcha)}</span>
      </div>
    </Link>
  )
}
