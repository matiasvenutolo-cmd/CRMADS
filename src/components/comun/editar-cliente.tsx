'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClienteForm } from '@/components/forms/cliente-form'
import type { Cliente } from '@/lib/db/schema'
import { usePuedeEditar } from '@/components/shell/permisos'

export function EditarCliente({ cliente }: { cliente: Cliente }) {
  const [abierto, setAbierto] = useState(false)
  if (!usePuedeEditar()) return null
  return (
    <>
      <Button variante="secondary" onClick={() => setAbierto(true)}>
        <Pencil className="size-4" />
        Editar
      </Button>
      {abierto && <ClienteForm abierto onCerrar={() => setAbierto(false)} existente={cliente} />}
    </>
  )
}
