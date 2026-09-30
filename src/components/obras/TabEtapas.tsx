'use client'

import type { Obra } from '@/types'
import { useStore } from '@/store/useStore'
import { personaPorId } from '@/data/equipo'
import { formatDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TONE_ETAPA, LABEL_ETAPA } from '@/lib/badges'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

export function TabEtapas({ obra }: { obra: Obra }) {
  const completarEtapa = useStore((s) => s.completarEtapa)

  return (
    <div className="p-4 md:p-6">
      <ol className="relative border-l border-line pl-6">
        {obra.etapas.map((etapa) => {
          const responsable = personaPorId(etapa.responsableId)
          const puedeCompletar = etapa.estado === 'en_curso' || etapa.estado === 'atrasada'
          return (
            <li key={etapa.id} className="mb-6 last:mb-0">
              <span
                className={cn(
                  'absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-white',
                  etapa.estado === 'completa' ? 'bg-success' : etapa.estado === 'en_curso' ? 'bg-brand-blue' : etapa.estado === 'atrasada' ? 'bg-danger' : 'bg-line'
                )}
              >
                {etapa.estado === 'completa' && <Check size={10} className="text-white" strokeWidth={3} />}
              </span>
              <div className="rounded-card border border-line bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-display text-base font-bold text-ink">{etapa.nombre}</p>
                  <Badge tone={TONE_ETAPA[etapa.estado]}>{LABEL_ETAPA[etapa.estado]}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                  <span>Prevista: {formatDate(etapa.fechaPrevista)}</span>
                  {etapa.fechaReal && <span>Real: {formatDate(etapa.fechaReal)}</span>}
                  <span>Responsable: {responsable?.nombre}</span>
                </div>
                {etapa.notas && <p className="mt-2 rounded-[8px] bg-paper px-2.5 py-1.5 text-xs text-ink">{etapa.notas}</p>}
                {puedeCompletar && (
                  <Button variant="secondary" size="sm" className="mt-3" onClick={() => completarEtapa(obra.id, etapa.id)}>
                    <Check size={14} /> Marcar como completa
                  </Button>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
