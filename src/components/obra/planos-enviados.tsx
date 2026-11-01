'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { fijarPlanosEnviados } from '@/lib/actions/obras'
import { usePuedeEditar } from '@/components/shell/permisos'
import { useToast } from '@/components/ui/toast'
import { fechaCorta } from '@/lib/fechas'
import { cn } from '@/lib/utils'

export function PlanosEnviados({ obraId, fecha, hoy }: { obraId: string; fecha: string | null; hoy: string }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const texto = fecha ? fechaCorta(fecha) : 'Sin enviar'
  if (!usePuedeEditar()) return <span className={fecha ? 'font-medium text-ink' : 'text-ink-3'}>{texto}</span>
  return (
    <label className={cn('group relative inline-flex cursor-pointer', pendiente && 'opacity-50')}>
      <span className={cn('group-hover:text-accent group-hover:underline', fecha ? 'font-medium text-ink' : 'text-accent')}>{fecha ? texto : 'Cargar fecha'}</span>
      <input
        type="date"
        value={fecha ?? ''}
        max={hoy}
        onChange={(e) =>
          start(async () => {
            const r = await fijarPlanosEnviados(obraId, e.target.value || null)
            if (!r.ok) toast(r.error, 'error')
            router.refresh()
          })
        }
        className="absolute inset-0 cursor-pointer opacity-0"
        aria-label="Fecha de envío de los planos al cliente"
      />
    </label>
  )
}
