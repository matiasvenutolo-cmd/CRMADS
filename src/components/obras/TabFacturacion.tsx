'use client'

import { useState } from 'react'
import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { formatMoney, formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TONE_HITO } from '@/lib/badges'
import { ComprobantePreviewModal } from './ComprobantePreviewModal'
import { CobroModal } from './CobroModal'
import { Receipt, Landmark } from 'lucide-react'

export function TabFacturacion({ obra }: { obra: Obra }) {
  const facturarHito = useStore((s) => s.facturarHito)
  const [verComprobanteId, setVerComprobanteId] = useState<string | null>(null)
  const [cobrarId, setCobrarId] = useState<string | null>(null)

  const totalObra = obra.planPagos.reduce((acc, h) => acc + h.monto, 0)
  const cobrado = obra.planPagos.filter((h) => h.estado === 'Cobrado').reduce((acc, h) => acc + h.monto, 0)
  const saldo = totalObra - cobrado

  const hitoVisto = obra.planPagos.find((h) => h.id === verComprobanteId)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Resumen label="Total de la obra" valor={formatMoney(totalObra)} />
        <Resumen label="Cobrado" valor={formatMoney(cobrado)} tono="success" />
        <Resumen label="Saldo pendiente" valor={formatMoney(saldo)} tono={saldo > 0 ? 'orange' : undefined} />
      </div>

      <div className="space-y-2">
        {obra.planPagos.map((hito) => (
          <div key={hito.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-white p-4">
            <div className="min-w-0">
              <p className="font-medium text-ink">{hito.nombre}</p>
              <p className="font-display text-lg font-bold text-ink">{formatMoney(hito.monto)}</p>
              {hito.comprobante && (
                <p className="text-xs text-muted">
                  {hito.comprobante.tipo} {hito.comprobante.numero} · {formatDate(hito.comprobante.fecha)}
                </p>
              )}
              {hito.cobro && (
                <p className="text-xs text-success">
                  Cobrado por {hito.cobro.metodo} el {formatDate(hito.cobro.fecha)}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={TONE_HITO[hito.estado]}>{hito.estado}</Badge>
              {hito.estado === 'Listo para facturar' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    facturarHito(obra.id, hito.id)
                    setVerComprobanteId(hito.id)
                  }}
                >
                  <Receipt size={14} /> Facturar
                </Button>
              )}
              {hito.estado === 'Facturado' && (
                <>
                  <Button variant="secondary" size="sm" onClick={() => setVerComprobanteId(hito.id)}>
                    Ver comprobante
                  </Button>
                  <Button variant="primary" size="sm" onClick={() => setCobrarId(hito.id)}>
                    <Landmark size={14} /> Registrar cobro
                  </Button>
                </>
              )}
              {hito.estado === 'Cobrado' && hito.comprobante && (
                <Button variant="secondary" size="sm" onClick={() => setVerComprobanteId(hito.id)}>
                  Ver comprobante
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <ComprobantePreviewModal
        comprobante={hitoVisto?.comprobante ?? null}
        clienteId={obra.clienteId}
        concepto={hitoVisto?.nombre ?? ''}
        onClose={() => setVerComprobanteId(null)}
      />
      <CobroModal obraId={obra.id} hitoId={cobrarId} onClose={() => setCobrarId(null)} />
    </div>
  )
}

function Resumen({ label, valor, tono }: { label: string; valor: string; tono?: 'success' | 'orange' }) {
  return (
    <div className="rounded-card border border-line bg-white p-3.5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`font-display text-xl font-bold ${tono === 'success' ? 'text-success' : tono === 'orange' ? 'text-brand-orange' : 'text-ink'}`}>{valor}</p>
    </div>
  )
}
