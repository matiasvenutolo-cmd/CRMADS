'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Field'
import { Plus } from 'lucide-react'

export function AgregarNota({ onAgregar }: { onAgregar: (texto: string) => void }) {
  const [abierto, setAbierto] = useState(false)
  const [texto, setTexto] = useState('')

  if (!abierto) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setAbierto(true)}>
        <Plus size={14} /> Agregar nota
      </Button>
    )
  }

  return (
    <div className="space-y-2">
      <Textarea rows={2} placeholder="Escribí una nota..." value={texto} onChange={(e) => setTexto(e.target.value)} autoFocus />
      <div className="flex justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setAbierto(false)
            setTexto('')
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!texto.trim()}
          onClick={() => {
            onAgregar(texto.trim())
            setTexto('')
            setAbierto(false)
          }}
        >
          Guardar
        </Button>
      </div>
    </div>
  )
}
