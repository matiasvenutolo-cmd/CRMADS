'use client'

import Link from 'next/link'
import type { Presupuesto } from '@/types'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney, formatDate, diasDesde } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { TONE_PRESUPUESTO } from '@/lib/badges'
import { EstadoVacio } from '@/components/EstadoVacio'

export function TablaPresupuestos({ presupuestos }: { presupuestos: Presupuesto[] }) {
  if (presupuestos.length === 0) {
    return (
      <div className="px-4 md:px-6">
        <EstadoVacio titulo="No hay presupuestos con estos filtros" descripcion="Probá ajustar la búsqueda o los filtros." />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto px-4 md:px-6">
      <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-sm">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
            <th className="px-3 pb-2">Número</th>
            <th className="px-3 pb-2">Cliente</th>
            <th className="px-3 pb-2">Tipología</th>
            <th className="px-3 pb-2">Monto</th>
            <th className="px-3 pb-2">Enviado</th>
            <th className="px-3 pb-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {presupuestos.map((p) => {
            const cliente = clientePorId(p.clienteId)
            const dias = diasDesde(p.fechaEnvio)
            const mostrarDias = p.estado === 'Enviado' || p.estado === 'En negociación'
            return (
              <tr key={p.id} className="rounded-[10px] bg-white shadow-sm">
                <td className="rounded-l-[10px] border-y border-l border-line px-3 py-3 font-medium text-ink">
                  <Link href={`/presupuestos/${p.id}`} className="hover:text-brand-blue">
                    {p.numero}
                  </Link>
                </td>
                <td className="border-y border-line px-3 py-3 text-ink">{cliente?.nombre}</td>
                <td className="border-y border-line px-3 py-3 text-muted">{p.datosTecnicos.tipologia}</td>
                <td className="border-y border-line px-3 py-3 font-medium text-ink">{formatMoney(montoActual(p))}</td>
                <td className="border-y border-line px-3 py-3 text-muted">
                  {formatDate(p.fechaEnvio)}
                  {mostrarDias && dias > 7 && <span className="ml-1.5 text-brand-orange">({dias}d)</span>}
                </td>
                <td className="rounded-r-[10px] border-y border-r border-line px-3 py-3">
                  <Badge tone={TONE_PRESUPUESTO[p.estado]}>{p.estado}</Badge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
