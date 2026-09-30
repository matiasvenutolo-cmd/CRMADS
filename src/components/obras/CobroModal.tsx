'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Label, Select } from '@/components/ui/Field'
import type { Cobro } from '@/types'

export function CobroModal({ obraId, hitoId, onClose }: { obraId: string; hitoId: string | null; onClose: () => void }) {
  const registrarCobro = useStore((s) => s.registrarCobro)
  const [metodo, setMetodo] = useState<Cobro['metodo']>('Transferencia')

  if (!hitoId) return null

  return (
    <Modal open onClose={onClose} titulo="Registrar cobro" maxWidth="max-w-sm">
      <div className="px-5 py-4">
        <Label>Método de pago</Label>
        <Select value={metodo} onChange={(e) => setMetodo(e.target.value as Cobro['metodo'])}>
          <option value="Transferencia">Transferencia</option>
          <option value="Cheque">Cheque</option>
          <option value="eCheq">eCheq</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2 border-t border-line px-5 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            registrarCobro(obraId, hitoId, metodo)
            onClose()
          }}
        >
          Registrar cobro
        </Button>
      </div>
    </Modal>
  )
}
