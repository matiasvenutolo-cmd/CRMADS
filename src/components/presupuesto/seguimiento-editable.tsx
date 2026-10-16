'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { reprogramarSeguimiento } from '@/lib/actions/presupuestos'
import { fechaCorta, relativo } from '@/lib/fechas'
import { cn } from '@/lib/utils'

export function SeguimientoEditable({ presupuestoId, fecha, hoy }: { presupuestoId: string; fecha: string | null; hoy: string }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  const vencido = fecha && fecha <= hoy
  return (
    <label className={cn('group relative inline-flex cursor-pointer flex-col', pendiente && 'opacity-50')}>
      <span className={cn('font-serif text-[26px] leading-none', vencido ? 'text-warn' : fecha ? 'text-ink' : 'text-ink-3')}>{fecha ? fechaCorta(fecha) : 'Sin fecha'}</span>
      <span className="mt-1.5 text-[12.5px] text-ink-3 group-hover:text-accent">{fecha ? `${vencido && fecha < hoy ? 'Vencido ' : ''}${relativo(fecha)} · cambiar` : 'Definir fecha'}</span>
      <input
        type="date"
        value={fecha ?? ''}
        onChange={(e) =>
          start(async () => {
            await reprogramarSeguimiento(presupuestoId, e.target.value || null)
            router.refresh()
          })
        }
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Próximo seguimiento"
      />
    </label>
  )
}
