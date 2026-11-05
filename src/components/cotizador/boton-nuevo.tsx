'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNuevo } from '@/components/shell/nuevo'
import { usePuedeEditar } from '@/components/shell/permisos'

export function BotonNuevoConCotizador() {
  const { abrir } = useNuevo()
  if (!usePuedeEditar()) return null
  return (
    <Button variante="primary" onClick={() => abrir('presupuesto', { cotizador: true })}>
      <Sparkles className="size-4" /> Nuevo presupuesto con cotizador
    </Button>
  )
}
