'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { ClienteSelector, type ValorCliente } from './cliente-selector'
import { ElegirFecha, Segmentado } from './segmentado'
import { CamposTecnicos } from './tecnicos'
import { crearPresupuesto, editarPresupuesto } from '@/lib/actions/presupuestos'
import { LOCALIDADES_SUGERIDAS, TIPOLOGIAS } from '@/lib/dominio'
import type { Presupuesto } from '@/lib/db/schema'
import { sumarDias } from '@/lib/fechas'

function formatearMonto(v: string) {
  const digitos = v.replace(/\D/g, '')
  return digitos ? new Intl.NumberFormat('es-AR').format(Number(digitos)) : ''
}

export function PresupuestoForm({
  abierto,
  onCerrar,
  opciones,
  hoy,
  existente,
}: {
  abierto: boolean
  onCerrar: () => void
  opciones: { id: string; nombre: string }[]
  hoy: string
  existente?: Presupuesto & { clienteNombre: string }
}) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [error, setError] = useState<string>()

  const [cliente, setCliente] = useState<ValorCliente>(existente ? { id: existente.clienteId, nombre: existente.clienteNombre } : null)
  const [direccion, setDireccion] = useState(existente?.direccion ?? '')
  const [localidad, setLocalidad] = useState(existente?.localidad ?? '')
  const [tipologia, setTipologia] = useState(existente?.tipologia ?? '')
  const [cantidad, setCantidad] = useState(String(existente?.cantidadEquipos ?? 1))
  const [monto, setMonto] = useState(existente?.monto != null ? formatearMonto(String(Math.round(existente.monto))) : '')
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>((existente?.moneda as 'ARS' | 'USD') ?? 'ARS')
  const [estado, setEstado] = useState<'borrador' | 'enviado'>('enviado')
  const [seguimiento, setSeguimiento] = useState<string | null>(existente ? existente.proximoSeguimiento : sumarDias(hoy, 7))
  const [tecnicos, setTecnicos] = useState({ cargaKg: existente?.cargaKg?.toString() ?? '', paradas: existente?.paradas?.toString() ?? '', velocidad: existente?.velocidad ?? '' })
  const [notas, setNotas] = useState(existente?.notas ?? '')

  function guardar() {
    setError(undefined)
    if (!existente && !cliente) return setError('Elegí o creá el cliente.')
    const datos = {
      clienteId: cliente?.id,
      clienteNuevo: cliente?.nuevo,
      direccion,
      localidad,
      tipologia,
      cantidadEquipos: cantidad,
      monto: monto.replace(/\./g, ''),
      moneda,
      estado,
      proximoSeguimiento: seguimiento ?? undefined,
      notas,
      ...tecnicos,
    }
    start(async () => {
      const r = existente ? await editarPresupuesto(existente.id, datos) : await crearPresupuesto(datos)
      if (!r.ok) return setError(r.error)
      toast(existente ? 'Presupuesto actualizado' : 'Presupuesto creado')
      onCerrar()
      if (!existente && r.data && 'id' in r.data) router.push(`/presupuestos/${r.data.id}`)
      else router.refresh()
    })
  }

  return (
    <Panel
      abierto={abierto}
      onCerrar={onCerrar}
      variante="hoja"
      titulo={existente ? 'Editar presupuesto' : 'Nuevo presupuesto'}
      descripcion={existente ? undefined : 'Lo mínimo para empezar a seguirlo. El resto se completa después.'}
      pie={
        <>
          {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
          <Button variante="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="primary" onClick={guardar} cargando={pendiente}>
            {existente ? 'Guardar cambios' : 'Crear presupuesto'}
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
        {!existente && (
          <Field label="Cliente" htmlFor="p-cliente">
            <ClienteSelector id="p-cliente" opciones={opciones} valor={cliente} onChange={setCliente} />
          </Field>
        )}

        <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[1fr_180px]">
          <Field label="Dirección de la obra" htmlFor="p-dir">
            <Input id="p-dir" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Mitre 2140" />
          </Field>
          <Field label="Localidad" htmlFor="p-loc" className="w-36 sm:w-auto">
            <Input id="p-loc" list="localidades" value={localidad} onChange={(e) => setLocalidad(e.target.value)} placeholder="Avellaneda" />
            <datalist id="localidades">
              {LOCALIDADES_SUGERIDAS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>

        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Tipología" htmlFor="p-tipo">
            <Select id="p-tipo" value={tipologia} onChange={(e) => setTipologia(e.target.value)}>
              <option value="" disabled>
                Elegí una
              </option>
              {TIPOLOGIAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Equipos" htmlFor="p-cant">
            <Input id="p-cant" inputMode="numeric" value={cantidad} onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>

        <Field label="Monto" htmlFor="p-monto" hint="Opcional si todavía no está cotizado.">
          <div className="flex gap-2">
            <Segmentado
              etiqueta="Moneda"
              valor={moneda}
              onChange={setMoneda}
              opciones={[
                { valor: 'ARS', label: '$' },
                { valor: 'USD', label: 'US$' },
              ]}
              className="shrink-0"
            />
            <Input id="p-monto" inputMode="numeric" value={monto} onChange={(e) => setMonto(formatearMonto(e.target.value))} placeholder="0" className="tabular text-right font-medium" />
          </div>
        </Field>

        {!existente && (
          <Field label="Estado">
            <Segmentado
              etiqueta="Estado"
              valor={estado}
              onChange={setEstado}
              opciones={[
                { valor: 'enviado', label: 'Ya lo envié' },
                { valor: 'borrador', label: 'Todavía no' },
              ]}
              className="w-full"
            />
          </Field>
        )}

        <Field label="¿Cuándo hacer el próximo seguimiento?">
          <ElegirFecha
            valor={seguimiento}
            onChange={setSeguimiento}
            hoy={hoy}
            opciones={[
              { dias: 3, label: 'En 3 días' },
              { dias: 7, label: 'En 1 semana' },
              { dias: 14, label: 'En 2 semanas' },
            ]}
          />
        </Field>

        <CamposTecnicos valor={tecnicos} onChange={setTecnicos} />

        <Field label="Notas" htmlFor="p-notas">
          <Textarea id="p-notas" value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Condiciones, alcance, lo que haga falta recordar." rows={3} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Panel>
  )
}
