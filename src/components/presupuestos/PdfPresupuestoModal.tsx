'use client'

import Image from 'next/image'
import type { Presupuesto } from '@/types'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney, formatDateLong } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Printer } from 'lucide-react'

export function PdfPresupuestoModal({ presupuesto, onClose }: { presupuesto: Presupuesto | null; onClose: () => void }) {
  if (!presupuesto) return null
  const cliente = clientePorId(presupuesto.clienteId)
  const dt = presupuesto.datosTecnicos
  const version = presupuesto.versiones[presupuesto.versiones.length - 1]

  return (
    <Modal open onClose={onClose} maxWidth="max-w-2xl">
      <div className="max-h-[75vh] overflow-y-auto p-8 print:p-0" id="presupuesto-pdf">
        <div className="flex items-start justify-between border-b border-line pb-5">
          <Image src="/logo/ads-logo.png" alt="ADS" width={90} height={50} />
          <div className="text-right text-xs text-muted">
            <p className="font-display text-base font-bold text-ink">Presupuesto {presupuesto.numero}</p>
            <p>Versión {version.version} · {formatDateLong(version.fecha)}</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Cliente</p>
            <p className="font-medium text-ink">{cliente?.nombre}</p>
            <p className="text-muted">{cliente?.cuit} · {cliente?.condicionIVA}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Obra</p>
            <p className="font-medium text-ink">{dt.direccion}</p>
            <p className="text-muted">{dt.localidad}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Datos técnicos</p>
          <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
            <Dato label="Tipología" valor={dt.tipologia} />
            <Dato label="Carga" valor={`${dt.cargaKg} kg`} />
            <Dato label="Paradas" valor={`${dt.paradas}`} />
            <Dato label="Recorrido" valor={`${dt.recorridoM} m`} />
            <Dato label="Velocidad" valor={dt.velocidad} />
            <Dato label="Puertas" valor={dt.tipoPuertas} />
            <Dato label="Cantidad de equipos" valor={`${dt.cantidadEquipos}`} />
          </div>
        </div>

        <div className="mt-6 rounded-[10px] bg-paper p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Monto total</p>
          <p className="font-display text-3xl font-bold text-ink">{formatMoney(montoActual(presupuesto))}</p>
          {version.nota && <p className="mt-1 text-xs text-muted">{version.nota}</p>}
        </div>

        <p className="mt-5 text-xs text-muted">
          Presupuesto válido por 30 días. Incluye provisión, fabricación, transporte, montaje y puesta en marcha del equipo según las condiciones técnicas
          detalladas. No incluye obra civil.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-4 print:hidden">
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={() => window.print()}>
          <Printer size={15} /> Imprimir
        </Button>
      </div>
    </Modal>
  )
}

function Dato({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted">{label}</p>
      <p className="font-medium text-ink">{valor}</p>
    </div>
  )
}
