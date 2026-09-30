'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { personaPorId } from '@/data/equipo'
import { montoActual } from '@/data/presupuestos'
import { formatMoney, formatDate, diasDesde } from '@/lib/format'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TONE_PRESUPUESTO } from '@/lib/badges'
import { HistorialTimeline } from '@/components/HistorialTimeline'
import { AgregarNota } from '@/components/AgregarNota'
import { AprobarModal } from './AprobarModal'
import { MotivoPerdidaModal } from './MotivoPerdidaModal'
import { PdfPresupuestoModal } from './PdfPresupuestoModal'
import { EstadoVacio } from '@/components/EstadoVacio'
import { FileText, CheckCircle2, XCircle, HardHat } from 'lucide-react'

export function FichaPresupuesto({ id }: { id: string }) {
  const presupuesto = useStore((s) => s.presupuestos.find((p) => p.id === id))
  const agregarNota = useStore((s) => s.agregarNotaPresupuesto)
  const [aprobarAbierto, setAprobarAbierto] = useState(false)
  const [perderAbierto, setPerderAbierto] = useState(false)
  const [pdfAbierto, setPdfAbierto] = useState(false)

  if (!presupuesto) {
    return (
      <div className="p-6">
        <EstadoVacio titulo="No encontramos ese presupuesto" />
      </div>
    )
  }

  const cliente = clientePorId(presupuesto.clienteId)
  const dt = presupuesto.datosTecnicos
  const dias = diasDesde(presupuesto.fechaEnvio)
  const puedeActuar = presupuesto.estado !== 'Aprobado' && presupuesto.estado !== 'Perdido'

  return (
    <div>
      <PageHeader
        titulo={presupuesto.numero}
        descripcion={cliente?.nombre}
        acciones={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={TONE_PRESUPUESTO[presupuesto.estado]}>{presupuesto.estado}</Badge>
            <Button variant="secondary" size="sm" onClick={() => setPdfAbierto(true)}>
              <FileText size={14} /> Generar PDF
            </Button>
            {puedeActuar && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setPerderAbierto(true)}>
                  <XCircle size={14} /> Marcar perdido
                </Button>
                <Button variant="primary" size="sm" onClick={() => setAprobarAbierto(true)}>
                  <CheckCircle2 size={14} /> Aprobar y convertir en obra
                </Button>
              </>
            )}
            {presupuesto.obraId && (
              <Link href={`/obras/${presupuesto.obraId}`}>
                <Button variant="primary" size="sm">
                  <HardHat size={14} /> Ver obra
                </Button>
              </Link>
            )}
          </div>
        }
      />

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
              <CardTitle>Versiones</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              {presupuesto.versiones.map((v) => (
                <div key={v.version} className="flex items-center justify-between rounded-[10px] bg-paper px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-ink">
                      v{v.version} · {formatDate(v.fecha)}
                    </p>
                    {v.nota && <p className="text-xs text-muted">{v.nota}</p>}
                  </div>
                  <p className="font-display text-lg font-bold text-ink">{formatMoney(v.monto)}</p>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historial de contacto</CardTitle>
              <AgregarNota onAgregar={(texto) => agregarNota(presupuesto.id, texto)} />
            </CardHeader>
            <CardBody>
              <HistorialTimeline eventos={presupuesto.historial} />
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
              <CardTitle>Seguimiento</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">Vendedor</span>
                <span className="font-medium text-ink">{personaPorId(presupuesto.vendedorId)?.nombre ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Enviado</span>
                <span className="font-medium text-ink">{formatDate(presupuesto.fechaEnvio)}</span>
              </div>
              {(presupuesto.estado === 'Enviado' || presupuesto.estado === 'En negociación') && (
                <div className="flex justify-between">
                  <span className="text-muted">Sin respuesta</span>
                  <span className={`font-medium ${dias > 7 ? 'text-brand-orange' : 'text-ink'}`}>{dias} días</span>
                </div>
              )}
              {presupuesto.proximoPaso && (
                <div className="mt-2 rounded-[10px] bg-paper px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Próximo paso</p>
                  <p className="text-ink">{presupuesto.proximoPaso}</p>
                </div>
              )}
              {presupuesto.motivoPerdida && (
                <div className="mt-2 rounded-[10px] bg-danger-bg px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-danger">Motivo de pérdida</p>
                  <p className="text-ink">{presupuesto.motivoPerdida}</p>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {aprobarAbierto && <AprobarModal presupuestoId={presupuesto.id} onClose={() => setAprobarAbierto(false)} />}
      {perderAbierto && <MotivoPerdidaModal presupuestoId={presupuesto.id} onClose={() => setPerderAbierto(false)} />}
      {pdfAbierto && <PdfPresupuestoModal presupuesto={presupuesto} onClose={() => setPdfAbierto(false)} />}
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
