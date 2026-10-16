'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNuevo } from '@/components/shell/nuevo'

export function BotonNuevo({ tipo, children, variante = 'primary' }: { tipo: 'presupuesto' | 'obra' | 'cliente'; children: React.ReactNode; variante?: 'primary' | 'secondary' }) {
  const { abrir } = useNuevo()
  return (
    <Button variante={variante} onClick={() => abrir(tipo)}>
      <Plus className="size-4" />
      {children}
    </Button>
  )
}
