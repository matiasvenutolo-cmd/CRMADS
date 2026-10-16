'use client'

import { useState, useTransition } from 'react'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { cambiarPassword } from '@/lib/actions/auth'

export function CambiarPassword({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [error, setError] = useState<string>()
  const [pendiente, start] = useTransition()
  const toast = useToast()

  function cerrar() {
    setActual('')
    setNueva('')
    setError(undefined)
    onCerrar()
  }

  return (
    <Panel
      abierto={abierto}
      onCerrar={cerrar}
      titulo="Cambiar contraseña"
      pie={
        <>
          <Button variante="ghost" onClick={cerrar}>
            Cancelar
          </Button>
          <Button
            variante="primary"
            cargando={pendiente}
            onClick={() =>
              start(async () => {
                const r = await cambiarPassword(actual, nueva)
                if (!r.ok) return setError(r.error)
                toast('Contraseña actualizada')
                cerrar()
              })
            }
          >
            Guardar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Contraseña actual" htmlFor="pw-actual">
          <Input id="pw-actual" type="password" autoComplete="current-password" value={actual} onChange={(e) => setActual(e.target.value)} />
        </Field>
        <Field label="Nueva contraseña" htmlFor="pw-nueva" hint="Mínimo 8 caracteres." error={error}>
          <Input id="pw-nueva" type="password" autoComplete="new-password" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        </Field>
      </div>
    </Panel>
  )
}
