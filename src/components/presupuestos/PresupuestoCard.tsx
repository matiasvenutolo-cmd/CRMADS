'use client'

import Link from 'next/link'
import type { Presupuesto } from '@/types'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney, diasDesde } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

export function PresupuestoCard({ presupuesto, draggable, onDragStart }: { presupuesto: Presupuesto; draggable?: boolean; onDragStart?: (e: React.DragEvent) => void }) {
  const cliente = clientePorId(presupuesto.clienteId)
  const dias = diasDesde(presupuesto.fechaEnvio)
  const mostrarDias = presupuesto.estado === 'Enviado' || presupuesto.estado === 'En negociación'

  return (
    <Link
      href={`/presupuestos/${presupuesto.id}`}
      draggable={draggable}
      onDragStart={onDragStart}
      className="block cursor-grab rounded-[10px] border border-line bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-muted">{presupuesto.numero}</p>
        {mostrarDias && dias > 7 && <Badge tone="orange">{dias}d sin resp.</Badge>}
      </div>
      <p className="mt-1 truncate font-medium text-ink">{cliente?.nombre}</p>
      <p className="truncate text-xs text-muted">{presupuesto.datosTecnicos.direccion}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-muted">{presupuesto.datosTecnicos.tipologia}</span>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-line pt-2">
        <span className="font-display text-lg font-bold text-ink">{formatMoney(montoActual(presupuesto))}</span>
        <span className="text-xs text-muted">{presupuesto.datosTecnicos.cargaKg} kg</span>
      </div>
    </Link>
  )
}
