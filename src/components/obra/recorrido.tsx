'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, CalendarPlus } from 'lucide-react'
import { fijarFechaPrevista } from '@/lib/actions/obras'
import { fechaCorta } from '@/lib/fechas'
import type { Etapa } from '@/lib/db/schema'
import { cn } from '@/lib/utils'

/** El hueco: una parada por etapa. Las fechas previstas se editan tocando la parada. */
export function Recorrido({ obraId, etapas, hoy }: { obraId: string; etapas: Etapa[]; hoy: string }) {
  return (
    <ol className="relative">
      <span className="absolute bottom-5 left-[19px] top-5 w-px bg-line-strong" aria-hidden />
      {etapas.map((e) => (
        <Parada key={e.id} obraId={obraId} etapa={e} hoy={hoy} />
      ))}
    </ol>
  )
}

function Parada({ obraId, etapa: e, hoy }: { obraId: string; etapa: Etapa; hoy: string }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  const actual = e.estado === 'en_curso'
  const hecha = e.estado === 'completa'
  const atrasada = actual && !!e.fechaPrevista && e.fechaPrevista < hoy

  return (
    <li className={cn('relative flex items-start gap-3.5 py-2.5', pendiente && 'opacity-60')}>
      <span
        className={cn(
          'relative z-[1] flex size-[39px] shrink-0 items-center justify-center rounded-[10px] border font-mono text-[12.5px]',
          hecha && 'border-brand bg-brand text-white',
          actual && (atrasada ? 'border-warn-dot bg-warn-soft text-warn' : 'border-accent bg-accent text-white shadow-[0_0_0_4px_var(--color-accent-soft)]'),
          !hecha && !actual && 'border-line-strong bg-surface text-ink-3'
        )}
      >
        {hecha ? <Check className="size-4" strokeWidth={2.5} /> : String(e.orden).padStart(2, '0')}
      </span>
      <div className="min-w-0 flex-1 pt-[3px]">
        <p className={cn('text-[14.5px] leading-snug', actual ? 'font-semibold text-ink' : hecha ? 'text-ink-2' : 'text-ink-2')}>{e.nombre}</p>
        <div className="mt-0.5 text-[12.5px]">
          {hecha ? (
            <span className="text-ink-3">Completa {e.fechaFin ? `el ${fechaCorta(e.fechaFin)}` : ''}</span>
          ) : (
            <label className="group relative inline-flex cursor-pointer items-center gap-1">
              {e.fechaPrevista ? (
                <span className={cn(atrasada ? 'font-medium text-warn' : 'text-ink-3', 'group-hover:text-accent group-hover:underline')}>
                  {atrasada ? 'Atrasada · prevista ' : 'Prevista '}
                  {fechaCorta(e.fechaPrevista)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-ink-3/80 group-hover:text-accent">
                  <CalendarPlus className="size-3.5" />
                  Fecha prevista
                </span>
              )}
              <input
                type="date"
                value={e.fechaPrevista ?? ''}
                onChange={(ev) =>
                  start(async () => {
                    await fijarFechaPrevista(obraId, e.id, ev.target.value || null)
                    router.refresh()
                  })
                }
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label={`Fecha prevista de ${e.nombre}`}
              />
            </label>
          )}
        </div>
      </div>
    </li>
  )
}
