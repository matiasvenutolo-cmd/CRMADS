'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuItem } from '@/components/ui/menu'
import { Panel } from '@/components/ui/panel'
import { useToast } from '@/components/ui/toast'
import { Composer } from '@/components/comun/composer'
import { reprogramarSeguimiento } from '@/lib/actions/presupuestos'
import { sumarDias } from '@/lib/fechas'

export function AccionesSeguimiento({ presupuestoId, titulo, hoy, conPosponer = true }: { presupuestoId: string; titulo: string; hoy: string; conPosponer?: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const [, start] = useTransition()
  const router = useRouter()
  const toast = useToast()

  function posponer(dias: number) {
    start(async () => {
      await reprogramarSeguimiento(presupuestoId, sumarDias(hoy, dias))
      toast('Seguimiento reprogramado')
      router.refresh()
    })
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {conPosponer && (
        <Menu
          disparador={({ alternar }) => (
            <Button tamano="sm" variante="ghost" onClick={alternar} aria-label="Posponer" className="px-2">
              <CalendarClock className="size-4" />
              <span className="max-sm:hidden">Posponer</span>
            </Button>
          )}
        >
          {(cerrar) => (
            <>
              <MenuItem onClick={() => (cerrar(), posponer(1))}>Mañana</MenuItem>
              <MenuItem onClick={() => (cerrar(), posponer(3))}>En 3 días</MenuItem>
              <MenuItem onClick={() => (cerrar(), posponer(7))}>En una semana</MenuItem>
            </>
          )}
        </Menu>
      )}
      <Button tamano="sm" variante="secondary" onClick={() => setAbierto(true)}>
        Registrar contacto
      </Button>
      <Panel abierto={abierto} onCerrar={() => setAbierto(false)} titulo="Registrar contacto" descripcion={titulo} className="md:max-w-[520px]">
        {abierto && <Composer destino={{ presupuestoId }} hoy={hoy} onListo={() => setAbierto(false)} autoFocus />}
      </Panel>
    </div>
  )
}
