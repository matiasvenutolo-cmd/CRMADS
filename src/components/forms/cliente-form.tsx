'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Field, Input, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { crearCliente, editarCliente } from '@/lib/actions/clientes'
import type { Cliente } from '@/lib/db/schema'

export function ClienteForm({ abierto, onCerrar, existente }: { abierto: boolean; onCerrar: () => void; existente?: Cliente }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [error, setError] = useState<string>()
  const [d, setD] = useState({
    nombre: existente?.nombre ?? '',
    contacto: existente?.contacto ?? '',
    telefono: existente?.telefono ?? '',
    email: existente?.email ?? '',
    cuit: existente?.cuit ?? '',
    notas: existente?.notas ?? '',
  })
  const set = (k: keyof typeof d) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value })

  function guardar() {
    setError(undefined)
    start(async () => {
      const r = existente ? await editarCliente(existente.id, d) : await crearCliente(d)
      if (!r.ok) return setError(r.error)
      toast(existente ? 'Cliente actualizado' : 'Cliente creado')
      onCerrar()
      if (!existente && r.data && 'id' in r.data) router.push(`/clientes/${r.data.id}`)
      else router.refresh()
    })
  }

  return (
    <Panel
      abierto={abierto}
      onCerrar={onCerrar}
      variante="hoja"
      titulo={existente ? 'Editar cliente' : 'Nuevo cliente'}
      pie={
        <>
          {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
          <Button variante="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="primary" onClick={guardar} cargando={pendiente}>
            {existente ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          guardar()
        }}
      >
        <Field label="Nombre" htmlFor="c-nombre" hint="Constructora, estudio, desarrolladora o consorcio.">
          <Input id="c-nombre" value={d.nombre} onChange={set('nombre')} data-autofocus />
        </Field>
        <Field label="Persona de contacto" htmlFor="c-contacto">
          <Input id="c-contacto" value={d.contacto} onChange={set('contacto')} placeholder="Nombre y cargo" />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Teléfono" htmlFor="c-tel">
            <Input id="c-tel" type="tel" value={d.telefono} onChange={set('telefono')} placeholder="11 4222 0000" />
          </Field>
          <Field label="Mail" htmlFor="c-mail">
            <Input id="c-mail" type="email" value={d.email} onChange={set('email')} />
          </Field>
        </div>
        <Field label="CUIT" htmlFor="c-cuit">
          <Input id="c-cuit" value={d.cuit} onChange={set('cuit')} placeholder="30-00000000-0" />
        </Field>
        <Field label="Notas" htmlFor="c-notas">
          <Textarea id="c-notas" value={d.notas} onChange={set('notas')} rows={3} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Panel>
  )
}
