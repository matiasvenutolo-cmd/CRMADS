'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney } from '@/lib/format'
import { EQUIPO, ROL_LABEL } from '@/data/equipo'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Label, Select } from '@/components/ui/Field'
import { CheckCircle2 } from 'lucide-react'

export function AprobarModal({ presupuestoId, onClose }: { presupuestoId: string | null; onClose: () => void }) {
  const presupuestos = useStore((s) => s.presupuestos)
  const aprobarPresupuesto = useStore((s) => s.aprobarPresupuesto)
  const router = useRouter()
  const [anticipoPct, setAnticipoPct] = useState(30)
  const [responsableId, setResponsableId] = useState(EQUIPO.find((p) => p.rol === 'responsable_obra')?.id ?? '')
  const [obraCreadaId, setObraCreadaId] = useState<string | null>(null)

  const pre = presupuestos.find((p) => p.id === presupuestoId)

  function cerrarYLimpiar() {
    setObraCreadaId(null)
    onClose()
  }

  if (!pre) return null
  const cliente = clientePorId(pre.clienteId)
  const monto = montoActual(pre)

  function confirmar() {
    if (!pre) return
    const { obraId } = aprobarPresupuesto(pre.id, anticipoPct / 100, responsableId)
    setObraCreadaId(obraId)
  }

  if (obraCreadaId) {
    return (
      <Modal open onClose={cerrarYLimpiar} maxWidth="max-w-sm">
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="animate-pop-in">
            <circle cx="28" cy="28" r="26" fill="var(--color-success-bg)" stroke="var(--color-success)" strokeWidth="2" />
            <g className="animate-check-draw">
              <path d="M17 29l7 7 15-15" stroke="var(--color-success)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </g>
          </svg>
          <p className="font-display text-xl font-bold text-ink">¡Obra creada!</p>
          <p className="text-sm text-muted">El presupuesto se aprobó, el anticipo quedó facturado y la obra ya está en seguimiento.</p>
          <Button
            variant="primary"
            className="mt-2 w-full"
            onClick={() => {
              router.push(`/obras/${obraCreadaId}`)
              cerrarYLimpiar()
            }}
          >
            Ver ficha de obra
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={onClose} titulo="Aprobar y convertir en obra">
      <div className="space-y-4 px-5 py-4">
        <div className="rounded-[10px] bg-paper px-3 py-2.5 text-sm">
          <p className="font-medium text-ink">{cliente?.nombre}</p>
          <p className="text-muted">{pre.datosTecnicos.direccion}</p>
          <p className="mt-1 font-display text-lg font-bold text-ink">{formatMoney(monto)}</p>
        </div>

        <div>
          <Label>Anticipo</Label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={10}
              max={50}
              step={5}
              value={anticipoPct}
              onChange={(e) => setAnticipoPct(Number(e.target.value))}
              className="flex-1 accent-brand-blue"
            />
            <span className="w-12 shrink-0 text-right text-sm font-semibold text-ink">{anticipoPct}%</span>
          </div>
          <p className="mt-1 text-xs text-muted">{formatMoney(Math.round(monto * (anticipoPct / 100)))} a facturar y cobrar ahora</p>
        </div>

        <div>
          <Label>Responsable de obra</Label>
          <Select value={responsableId} onChange={(e) => setResponsableId(e.target.value)}>
            {EQUIPO.filter((p) => p.rol === 'responsable_obra' || p.rol === 'comercial').map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} · {ROL_LABEL[p.rol]}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={confirmar}>
          <CheckCircle2 size={16} /> Aprobar y convertir en obra
        </Button>
      </div>
    </Modal>
  )
}
