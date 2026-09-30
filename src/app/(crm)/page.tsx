'use client'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardBody } from '@/components/ui/Card'
import { useStore } from '@/store/useStore'
import { formatMoney } from '@/lib/format'
import { montoActual } from '@/data/presupuestos'
import { ProximaEtapa } from '@/components/EstadoVacio'

export default function InicioPage() {
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)

  const abiertos = presupuestos.filter((p) => p.estado !== 'Aprobado' && p.estado !== 'Perdido')
  const montoAbierto = abiertos.reduce((acc, p) => acc + montoActual(p), 0)
  const enCurso = obras.filter((o) => o.etapas.some((e) => e.estado === 'en_curso' || e.estado === 'atrasada'))
  const atrasadas = obras.filter((o) => o.etapas.some((e) => e.estado === 'atrasada'))

  return (
    <div>
      <PageHeader titulo="Inicio" descripcion="Resumen general de presupuestos y obras" />
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4 md:p-6">
        <Kpi titulo="Presupuestos abiertos" valor={`${abiertos.length}`} sub={formatMoney(montoAbierto)} />
        <Kpi titulo="Obras en curso" valor={`${enCurso.length}`} />
        <Kpi titulo="Obras atrasadas" valor={`${atrasadas.length}`} tono={atrasadas.length > 0 ? 'orange' : undefined} />
        <Kpi titulo="Total de obras" valor={`${obras.length}`} />
      </div>
      <div className="p-4 pt-0 md:p-6 md:pt-0" id="asistente">
        <Card>
          <CardBody className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Tablero completo, gráficos y asistente con IA</p>
            <ProximaEtapa />
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Kpi({ titulo, valor, sub, tono }: { titulo: string; valor: string; sub?: string; tono?: 'orange' }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-muted">{titulo}</p>
        <p className={`font-display text-3xl font-bold ${tono === 'orange' ? 'text-brand-orange' : 'text-ink'}`}>{valor}</p>
        {sub && <p className="mt-0.5 text-xs text-muted">{sub}</p>}
      </CardBody>
    </Card>
  )
}
