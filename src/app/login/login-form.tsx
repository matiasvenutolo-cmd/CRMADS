'use client'

import { useActionState } from 'react'
import { iniciarSesion } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Field, Input } from '@/components/ui/field'

export function LoginForm() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, undefined)

  return (
    <form action={accion} className="mt-8 flex flex-col gap-4">
      <Field label="Usuario" htmlFor="usuario">
        <Input id="usuario" name="usuario" key={estado?.usuario} defaultValue={estado?.usuario} autoComplete="username" autoCapitalize="none" autoFocus={!estado?.usuario} required className="h-11" />
      </Field>
      <Field label="Contraseña" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" autoFocus={Boolean(estado?.usuario)} required className="h-11" />
      </Field>
      {estado?.error && (
        <p role="alert" className="rounded-control bg-bad-soft px-3 py-2.5 text-[13.5px] text-bad">
          {estado.error}
        </p>
      )}
      <Button type="submit" variante="primary" tamano="lg" cargando={enviando} className="mt-2 w-full justify-center">
        Ingresar
      </Button>
    </form>
  )
}
