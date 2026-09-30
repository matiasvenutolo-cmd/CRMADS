'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { MOTIVOS_PERDIDA } from '@/data/constants'
import type { MotivoPerdida } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Label, Select } from '@/components/ui/Field'

export function MotivoPerdidaModal({ presupuestoId, onClose }: { presupuestoId: string | null; onClose: () => void }) {
  const marcarPerdido = useStore((s) => s.marcarPerdido)
  const [motivo, setMotivo] = useState<MotivoPerdida>('Precio')

  if (!presupuestoId) return null

  return (
    <Modal open onClose={onClose} titulo="Marcar como perdido" maxWidth="max-w-sm">
      <div className="space-y-4 px-5 py-4">
        <div>
          <Label>Motivo</Label>
          <Select value={motivo} onChange={(e) => setMotivo(e.target.value as MotivoPerdida)}>
            {MOTIVOS_PERDIDA.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-4">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={() => {
            marcarPerdido(presupuestoId, motivo)
            onClose()
          }}
        >
          Marcar como perdido
        </Button>
      </div>
    </Modal>
  )
}
