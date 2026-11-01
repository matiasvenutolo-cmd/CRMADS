'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { cambiarFechaAprobacion, cambiarFechaEnvio, reprogramarSeguimiento } from '@/lib/actions/presupuestos'
import { fechaCorta, relativo } from '@/lib/fechas'
import { cn } from '@/lib/utils'
import { usePuedeEditar } from '@/components/shell/permisos'

export function SeguimientoEditable({ presupuestoId, fecha, hoy }: { presupuestoId: string; fecha: string | null; hoy: string }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  const vencido = fecha && fecha <= hoy
  const puedeEditar = usePuedeEditar()
  if (!puedeEditar)
    return <span className={cn('font-serif text-[26px] leading-none', vencido ? 'text-warn' : fecha ? 'text-ink' : 'text-ink-3')}>{fecha ? fechaCorta(fecha) : 'Sin fecha'}</span>
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

export function FechaEnvioEditable({ presupuestoId, fecha, hoy }: { presupuestoId: string; fecha: string; hoy: string }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  if (!usePuedeEditar())
    return (
      <span className="mt-2 block text-[12.5px] text-ink-3">
        Enviado el {fechaCorta(fecha)} · {relativo(fecha)}
      </span>
    )
  return (
    <label className={cn('group relative mt-2 inline-flex cursor-pointer text-[12.5px] text-ink-3', pendiente && 'opacity-50')}>
      <span className="group-hover:text-accent group-hover:underline">
        Enviado el {fechaCorta(fecha)} · {relativo(fecha)}
      </span>
      <input
        type="date"
        value={fecha}
        max={hoy}
        onChange={(e) =>
          e.target.value &&
          start(async () => {
            await cambiarFechaEnvio(presupuestoId, e.target.value)
            router.refresh()
          })
        }
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Fecha de envío"
      />
    </label>
  )
}

export function FechaAprobacionEditable({ presupuestoId, fecha, hoy }: { presupuestoId: string; fecha: string | null; hoy: string }) {
  const router = useRouter()
  const [pendiente, start] = useTransition()
  const texto = fecha ? `Aprobado el ${fechaCorta(fecha)}` : 'Sin fecha de aprobación'
  if (!usePuedeEditar()) return <span className="mt-1 block text-[12.5px] text-ink-3">{texto}</span>
  return (
    <label className={cn('group relative mt-1 flex w-fit cursor-pointer text-[12.5px] text-ink-3', pendiente && 'opacity-50')}>
      <span className="group-hover:text-accent group-hover:underline">{fecha ? texto : 'Cargar fecha de aprobación'}</span>
      <input
        type="date"
        value={fecha ?? ''}
        max={hoy}
        onChange={(e) =>
          e.target.value &&
          start(async () => {
            await cambiarFechaAprobacion(presupuestoId, e.target.value)
            router.refresh()
          })
        }
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Fecha de aprobación"
      />
    </label>
  )
}
