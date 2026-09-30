'use client'

import Link from 'next/link'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney } from '@/lib/format'
import { presupuestosDeCliente, obrasDeCliente, tasaAprobacion, saldoPendienteDeCliente } from '@/lib/clienteHelpers'
import { progresoObra, etapaActual } from '@/lib/obraHelpers'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { TONE_PRESUPUESTO } from '@/lib/badges'
import { EstadoVacio } from '@/components/EstadoVacio'

export function FichaCliente({ id }: { id: string }) {
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)
  const cliente = clientePorId(id)

  if (!cliente) {
    return (
      <div className="p-6">
        <EstadoVacio titulo="No encontramos ese cliente" />
      </div>
    )
  }

  const pres = presupuestosDeCliente(presupuestos, id)
  const obs = obrasDeCliente(obras, id)
  const tasa = tasaAprobacion(pres)
  const saldo = saldoPendienteDeCliente(obs)

  return (
    <div>
      <PageHeader titulo={cliente.nombre} descripcion={`${cliente.tipo} · ${cliente.localidad}`} />

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 md:p-6">
        <Kpi titulo="Presupuestos" valor={`${pres.length}`} />
        <Kpi titulo="Obras" valor={`${obs.length}`} />
        <Kpi titulo="Tasa de aprobación" valor={tasa !== null ? `${tasa}%` : '—'} />
        <Kpi titulo="Saldo pendiente de cobro" valor={formatMoney(saldo)} tono={saldo > 0 ? 'orange' : undefined} />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 md:grid-cols-3 md:p-6 md:pt-0">
        <div className="space-y-4 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {pres.length === 0 && <p className="text-sm text-muted">Sin presupuestos todavía.</p>}
              {pres.map((p) => (
                <Link key={p.id} href={`/presupuestos/${p.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-2 hover:bg-paper">
                  <div>
                    <p className="text-sm font-medium text-ink">{p.numero}</p>
                    <p className="text-xs text-muted">{p.datosTecnicos.direccion}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{formatMoney(montoActual(p))}</span>
                    <Badge tone={TONE_PRESUPUESTO[p.estado]}>{p.estado}</Badge>
                  </div>
                </Link>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Obras</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2">
              {obs.length === 0 && <p className="text-sm text-muted">Sin obras todavía.</p>}
              {obs.map((o) => (
                <Link key={o.id} href={`/obras/${o.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-2 hover:bg-paper">
                  <div>
                    <p className="text-sm font-medium text-ink">{o.numero}</p>
                    <p className="text-xs text-muted">{etapaActual(o).nombre}</p>
                  </div>
                  <span className="text-sm font-medium text-ink">{progresoObra(o)}%</span>
                </Link>
              ))}
            </CardBody>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Datos</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3 text-sm">
            <p className="text-muted">
              {cliente.cuit} · {cliente.condicionIVA}
            </p>
            {cliente.contactos.map((c) => (
              <div key={c.id} className="border-t border-line pt-2">
                <p className="font-medium text-ink">{c.nombre}</p>
                <p className="text-xs text-muted">{c.cargo}</p>
                <p className="text-xs text-muted">{c.telefono}</p>
                <p className="text-xs text-muted">{c.email}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Kpi({ titulo, valor, tono }: { titulo: string; valor: string; tono?: 'orange' }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-muted">{titulo}</p>
        <p className={`font-display text-2xl font-bold ${tono === 'orange' ? 'text-brand-orange' : 'text-ink'}`}>{valor}</p>
      </CardBody>
    </Card>
  )
}
