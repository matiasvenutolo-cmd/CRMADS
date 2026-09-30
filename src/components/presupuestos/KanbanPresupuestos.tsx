'use client'

import { useState } from 'react'
import type { Presupuesto, EstadoPresupuesto } from '@/types'
import { useStore } from '@/store/useStore'
import { PresupuestoCard } from './PresupuestoCard'
import { AprobarModal } from './AprobarModal'
import { MotivoPerdidaModal } from './MotivoPerdidaModal'
import { TONE_CLASSES, TONE_PRESUPUESTO } from '@/lib/badges'
import { cn } from '@/lib/utils'

const COLUMNAS: EstadoPresupuesto[] = ['Borrador', 'Enviado', 'En negociación', 'Aprobado', 'Perdido']

export function KanbanPresupuestos({ presupuestos }: { presupuestos: Presupuesto[] }) {
  const moverPresupuesto = useStore((s) => s.moverPresupuesto)
  const [dragId, setDragId] = useState<string | null>(null)
  const [colHover, setColHover] = useState<EstadoPresupuesto | null>(null)
  const [aprobarId, setAprobarId] = useState<string | null>(null)
  const [perderId, setPerderId] = useState<string | null>(null)

  function onDrop(estado: EstadoPresupuesto) {
    setColHover(null)
    if (!dragId) return
    const pre = presupuestos.find((p) => p.id === dragId)
    setDragId(null)
    if (!pre || pre.estado === estado) return
    if (estado === 'Aprobado') {
      setAprobarId(pre.id)
    } else if (estado === 'Perdido') {
      setPerderId(pre.id)
    } else {
      moverPresupuesto(pre.id, estado)
    }
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto p-4 md:p-6">
        {COLUMNAS.map((col) => {
          const items = presupuestos.filter((p) => p.estado === col)
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault()
                setColHover(col)
              }}
              onDragLeave={() => setColHover(null)}
              onDrop={() => onDrop(col)}
              className={cn(
                'flex w-72 shrink-0 flex-col rounded-card border border-line bg-paper/60 transition-colors',
                colHover === col && 'border-brand-blue bg-brand-blue/5'
              )}
            >
              <div className="flex items-center justify-between px-3 py-3">
                <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', TONE_CLASSES[TONE_PRESUPUESTO[col]])}>{col}</span>
                <span className="text-xs font-medium text-muted">{items.length}</span>
              </div>
              <div className="flex flex-1 flex-col gap-2 px-2 pb-3">
                {items.map((p) => (
                  <div key={p.id} draggable onDragStart={() => setDragId(p.id)} onDragEnd={() => setDragId(null)}>
                    <PresupuestoCard presupuesto={p} />
                  </div>
                ))}
                {items.length === 0 && <p className="px-2 py-4 text-center text-xs text-muted">Sin presupuestos</p>}
              </div>
            </div>
          )
        })}
      </div>
      <AprobarModal presupuestoId={aprobarId} onClose={() => setAprobarId(null)} />
      <MotivoPerdidaModal presupuestoId={perderId} onClose={() => setPerderId(null)} />
    </>
  )
}
