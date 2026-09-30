'use client'

import { useState } from 'react'
import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { clientePorId } from '@/data/clientes'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Check, FileOutput } from 'lucide-react'
import { cn } from '@/lib/utils'

export function TabExpediente({ obra }: { obra: Obra }) {
  const toggle = useStore((s) => s.toggleExpediente)
  const [previewAbierto, setPreviewAbierto] = useState(false)
  const cliente = clientePorId(obra.clienteId)
  const completos = obra.expediente.filter((i) => i.completo).length
  const pct = Math.round((completos / obra.expediente.length) * 100)

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex-1">
          <p className="text-sm text-muted">Documentación para la Resolución 27, {completos}/{obra.expediente.length} completa</p>
          <div className="mt-1.5 h-2 w-full max-w-sm overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-brand-blue" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <Button variant="secondary" size="sm" disabled={pct < 100} onClick={() => setPreviewAbierto(true)}>
          <FileOutput size={14} /> Generar expediente
        </Button>
      </div>

      <div className="space-y-2">
        {obra.expediente.map((item) => (
          <button
            key={item.id}
            onClick={() => toggle(obra.id, item.id)}
            className="flex w-full items-center gap-3 rounded-card border border-line bg-white p-3.5 text-left transition-colors hover:bg-paper"
          >
            <span
              className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-[6px] border-2',
                item.completo ? 'border-success bg-success' : 'border-line bg-white'
              )}
            >
              {item.completo && <Check size={14} className="text-white" strokeWidth={3} />}
            </span>
            <span className={cn('text-sm font-medium', item.completo ? 'text-ink' : 'text-muted')}>{item.nombre}</span>
          </button>
        ))}
      </div>

      <Modal open={previewAbierto} onClose={() => setPreviewAbierto(false)} titulo="Expediente técnico" maxWidth="max-w-md">
        <div className="space-y-2 px-5 py-4 text-sm">
          <p className="font-medium text-ink">{obra.numero} · {cliente?.nombre}</p>
          <p className="text-muted">{obra.datosTecnicos.direccion}</p>
          <ul className="mt-3 space-y-1.5">
            {obra.expediente.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-ink">
                <Check size={14} className="text-success" /> {item.nombre}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
          <Button variant="primary" onClick={() => setPreviewAbierto(false)}>
            Cerrar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
