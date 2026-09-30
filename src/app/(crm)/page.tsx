'use client'

import Link from 'next/link'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { personaPorId } from '@/data/equipo'
import { formatMoney, formatDate, diasDesde } from '@/lib/format'
import { BarraSimple } from '@/components/BarraSimple'
import { AsistentePanel } from '@/components/AsistentePanel'
import { EstadoVacio } from '@/components/EstadoVacio'
import {
  kpisTablero,
  presupuestosSinRespuesta,
  obrasAtrasadas,
  hitosDeLaSemana,
  cobrosVencidos,
  actividadReciente,
  presupuestosPorEstado,
  obrasPorEtapa,
} from '@/lib/dashboard'
import { todosLosHitos } from '@/lib/facturacionHelpers'
import { AlertTriangle } from 'lucide-react'

export default function InicioPage() {
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)

  const kpis = kpisTablero(presupuestos, obras)
  const sinRespuesta = presupuestosSinRespuesta(presupuestos)
  const atrasadas = obrasAtrasadas(obras)
  const semana = hitosDeLaSemana(obras)
  const listosFacturar = todosLosHitos(obras).filter((h) => h.hito.estado === 'Listo para facturar')
  const vencidos = cobrosVencidos(obras)
  const actividad = actividadReciente(presupuestos, obras)

  const necesitaAtencion = sinRespuesta.length + atrasadas.length + semana.length + listosFacturar.length + vencidos.length

  return (
    <div>
      <PageHeader titulo="Inicio" descripcion="Resumen general de presupuestos y obras" />

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 lg:grid-cols-6 md:p-6">
        <Kpi titulo="Presupuestos abiertos" valor={`${kpis.presupuestosAbiertos}`} sub={formatMoney(kpis.montoAbierto)} />
        <Kpi titulo="Tasa aprobación (90d)" valor={kpis.tasaAprobacion !== null ? `${kpis.tasaAprobacion}%` : '—'} />
        <Kpi titulo="Obras en curso" valor={`${kpis.obrasEnCurso}`} />
        <Kpi titulo="Obras atrasadas" valor={`${kpis.obrasAtrasadas}`} tono={kpis.obrasAtrasadas > 0 ? 'orange' : undefined} />
        <Kpi titulo="A facturar" valor={formatMoney(kpis.aFacturar)} />
        <Kpi titulo="Pendiente de cobro" valor={formatMoney(kpis.pendienteDeCobro)} />
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-3 md:p-6 md:pt-0">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-brand-orange" /> Necesita atención
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {necesitaAtencion === 0 && <EstadoVacio titulo="Todo al día" descripcion="No hay nada urgente por ahora." />}

            {sinRespuesta.length > 0 && (
              <Grupo titulo="Presupuestos sin respuesta (+7 días)">
                {sinRespuesta.map((p) => (
                  <Link key={p.id} href={`/presupuestos/${p.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 text-sm hover:bg-paper">
                    <span className="text-ink">
                      {p.numero} · {clientePorId(p.clienteId)?.nombre}
                    </span>
                    <Badge tone="orange">{diasDesde(p.fechaEnvio)}d</Badge>
                  </Link>
                ))}
              </Grupo>
            )}

            {atrasadas.length > 0 && (
              <Grupo titulo="Obras atrasadas">
                {atrasadas.map((o) => (
                  <Link key={o.id} href={`/obras/${o.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 text-sm hover:bg-paper">
                    <span className="text-ink">
                      {o.numero} · {clientePorId(o.clienteId)?.nombre}
                    </span>
                    <Badge tone="danger">Atrasada</Badge>
                  </Link>
                ))}
              </Grupo>
            )}

            {semana.length > 0 && (
              <Grupo titulo="Hitos de la semana">
                {semana.map(({ etapa, obra }) => (
                  <Link key={etapa.id} href={`/obras/${obra.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 text-sm hover:bg-paper">
                    <span className="text-ink">
                      {obra.numero} · {etapa.nombre}
                    </span>
                    <span className="text-xs text-muted">{formatDate(etapa.fechaPrevista)}</span>
                  </Link>
                ))}
              </Grupo>
            )}

            {listosFacturar.length > 0 && (
              <Grupo titulo="Listos para facturar">
                {listosFacturar.map(({ hito, obra }) => (
                  <Link key={hito.id} href={`/obras/${obra.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 text-sm hover:bg-paper">
                    <span className="text-ink">
                      {obra.numero} · {hito.nombre}
                    </span>
                    <span className="text-xs font-medium text-ink">{formatMoney(hito.monto)}</span>
                  </Link>
                ))}
              </Grupo>
            )}

            {vencidos.length > 0 && (
              <Grupo titulo="Cobros vencidos">
                {vencidos.map(({ hito, obra }) => (
                  <Link key={hito.id} href={`/obras/${obra.id}`} className="flex items-center justify-between rounded-[10px] px-2 py-1.5 text-sm hover:bg-paper">
                    <span className="text-ink">
                      {obra.numero} · {hito.nombre}
                    </span>
                    <Badge tone="danger">Vencido</Badge>
                  </Link>
                ))}
              </Grupo>
            )}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Presupuestos por estado</CardTitle>
            </CardHeader>
            <CardBody>
              <BarraSimple datos={presupuestosPorEstado(presupuestos).map((d) => ({ label: d.estado, cantidad: d.cantidad }))} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Obras por etapa</CardTitle>
            </CardHeader>
            <CardBody>
              <BarraSimple datos={obrasPorEtapa(obras).map((d) => ({ label: d.etapa, cantidad: d.cantidad }))} colorClase="bg-brand-orange" />
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 pt-0 lg:grid-cols-3 md:p-6 md:pt-0">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Actividad reciente del equipo</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {actividad.map((ev) => (
              <Link key={ev.id} href={ev.href} className="flex items-start justify-between gap-3 rounded-[10px] px-2 py-1.5 hover:bg-paper">
                <div className="text-sm">
                  <span className="font-medium text-ink">{ev.contexto}</span> <span className="text-muted">{ev.descripcion}</span>
                </div>
                <div className="shrink-0 text-right text-xs text-muted">
                  <p>{formatDate(ev.fecha)}</p>
                  <p>{personaPorId(ev.autorId)?.nombre}</p>
                </div>
              </Link>
            ))}
          </CardBody>
        </Card>

        <AsistentePanel />
      </div>
    </div>
  )
}

function Kpi({ titulo, valor, sub, tono }: { titulo: string; valor: string; sub?: string; tono?: 'orange' }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-muted">{titulo}</p>
        <p className={`font-display text-2xl font-bold ${tono === 'orange' ? 'text-brand-orange' : 'text-ink'}`}>{valor}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </CardBody>
    </Card>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">{titulo}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
