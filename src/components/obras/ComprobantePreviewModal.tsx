'use client'

import Image from 'next/image'
import type { Comprobante } from '@/types'
import { clientePorId } from '@/data/clientes'
import { formatMoney, formatDateLong } from '@/lib/format'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Printer } from 'lucide-react'

export function ComprobantePreviewModal({
  comprobante,
  clienteId,
  concepto,
  onClose,
}: {
  comprobante: Comprobante | null
  clienteId: string
  concepto: string
  onClose: () => void
}) {
  if (!comprobante) return null
  const cliente = clientePorId(clienteId)

  return (
    <Modal open onClose={onClose} maxWidth="max-w-md">
      <div className="p-6">
        <div className="flex items-start justify-between border-b border-line pb-4">
          <Image src="/logo/ads-logo.png" alt="ADS" width={70} height={39} />
          <div className="text-right">
            <p className="font-display text-sm font-bold text-ink">{comprobante.tipo}</p>
            <p className="text-xs text-muted">{comprobante.numero}</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 text-sm">
          <Fila label="Cliente" valor={cliente?.nombre ?? ''} />
          <Fila label="CUIT" valor={cliente?.cuit ?? ''} />
          <Fila label="Condición IVA" valor={cliente?.condicionIVA ?? ''} />
          <Fila label="Concepto" valor={concepto} />
          <Fila label="Fecha" valor={formatDateLong(comprobante.fecha)} />
          <Fila label="CAE" valor={comprobante.cae} />
        </div>
        <div className="mt-4 rounded-[10px] bg-paper p-4">
          <div className="flex justify-between text-sm text-muted">
            <span>Neto</span>
            <span>{formatMoney(comprobante.importe - comprobante.iva)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted">
            <span>IVA 21%</span>
            <span>{formatMoney(comprobante.iva)}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-line pt-1 font-display text-xl font-bold text-ink">
            <span>Total</span>
            <span>{formatMoney(comprobante.importe)}</span>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
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

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <span className="font-medium text-ink">{valor}</span>
    </div>
  )
}
