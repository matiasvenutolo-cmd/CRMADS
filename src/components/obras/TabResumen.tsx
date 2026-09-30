import Link from 'next/link'
import type { Obra } from '@/types'
import { clientePorId } from '@/data/clientes'
import { personaPorId } from '@/data/equipo'
import { formatDate } from '@/lib/format'
import { etapaActual, progresoObra } from '@/lib/obraHelpers'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'

export function TabResumen({ obra }: { obra: Obra }) {
  const cliente = clientePorId(obra.clienteId)
  const responsable = personaPorId(obra.responsableId)
  const dt = obra.datosTecnicos
  const progreso = progresoObra(obra)
  const actual = etapaActual(obra)

  return (
    <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3 md:p-6">
      <div className="space-y-4 md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Datos técnicos</CardTitle>
          </CardHeader>
          <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Dato label="Tipología" valor={dt.tipologia} />
            <Dato label="Carga" valor={`${dt.cargaKg} kg`} />
            <Dato label="Paradas" valor={`${dt.paradas}`} />
            <Dato label="Recorrido" valor={`${dt.recorridoM} m`} />
            <Dato label="Velocidad" valor={dt.velocidad} />
            <Dato label="Puertas" valor={dt.tipoPuertas} />
            <Dato label="Cant. de equipos" valor={`${dt.cantidadEquipos}`} />
            <Dato label="Dirección" valor={dt.direccion} />
            <Dato label="Localidad" valor={dt.localidad} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progreso general</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Etapa actual: {actual?.nombre}</span>
              <span className="font-semibold text-ink">{progreso}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-brand-blue" style={{ width: `${progreso}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted">Inicio de obra</p>
                <p className="font-medium text-ink">{formatDate(obra.fechaInicio)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Puesta en marcha estimada</p>
                <p className="font-medium text-ink">{formatDate(obra.fechaEstimadaPuestaEnMarcha)}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cliente</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Link href={`/clientes/${cliente?.id}`} className="font-medium text-brand-blue hover:underline">
              {cliente?.nombre}
            </Link>
            <p className="text-xs text-muted">
              {cliente?.cuit} · {cliente?.condicionIVA}
            </p>
            {cliente?.contactos.map((c) => (
              <div key={c.id} className="border-t border-line pt-2 text-sm">
                <p className="font-medium text-ink">{c.nombre}</p>
                <p className="text-xs text-muted">{c.cargo}</p>
                <p className="text-xs text-muted">{c.telefono}</p>
                <p className="text-xs text-muted">{c.email}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Responsable de obra</CardTitle>
          </CardHeader>
          <CardBody>
            <p className="font-medium text-ink">{responsable?.nombre}</p>
            <p className="text-xs text-muted">ADS · Responsable de obra</p>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="text-sm font-medium text-ink">{valor}</p>
    </div>
  )
}
