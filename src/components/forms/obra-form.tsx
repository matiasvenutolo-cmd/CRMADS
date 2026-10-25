'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { ClienteSelector, type ValorCliente } from './cliente-selector'
import { CamposTecnicos } from './tecnicos'
import { crearObra, editarObra } from '@/lib/actions/obras'
import { ETAPAS_OBRA, LOCALIDADES_SUGERIDAS, TIPOLOGIAS } from '@/lib/dominio'
import type { Obra } from '@/lib/db/schema'

export function ObraForm({ abierto, onCerrar, opciones, hoy, existente }: { abierto: boolean; onCerrar: () => void; opciones: { id: string; nombre: string }[]; hoy: string; existente?: Obra }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [error, setError] = useState<string>()

  const [cliente, setCliente] = useState<ValorCliente>(null)
  const [direccion, setDireccion] = useState(existente?.direccion ?? '')
  const [localidad, setLocalidad] = useState(existente?.localidad ?? '')
  const [tipologia, setTipologia] = useState(existente?.tipologia ?? '')
  const [cantidad, setCantidad] = useState(String(existente?.cantidadEquipos ?? 1))
  const [inicio, setInicio] = useState(existente?.fechaInicio ?? hoy)
  const [fin, setFin] = useState(existente?.fechaFinEstimada ?? '')
  const [etapa, setEtapa] = useState('1')
  const [tecnicos, setTecnicos] = useState({ cargaKg: existente?.cargaKg?.toString() ?? '', paradas: existente?.paradas?.toString() ?? '', velocidad: existente?.velocidad ?? '' })
  const [notas, setNotas] = useState(existente?.notas ?? '')

  function guardar() {
    setError(undefined)
    if (!existente && !cliente) return setError('Elegí o creá el cliente.')
    const datos = { clienteId: cliente?.id, clienteNuevo: cliente?.nuevo, direccion, localidad, tipologia, cantidadEquipos: cantidad, fechaInicio: inicio, fechaFinEstimada: fin, etapaActual: Number(etapa), notas, ...tecnicos }
    start(async () => {
      const r = existente ? await editarObra(existente.id, datos) : await crearObra(datos)
      if (!r.ok) return setError(r.error)
      toast(existente ? 'Obra actualizada' : 'Obra cargada')
      onCerrar()
      if (!existente && r.data && 'id' in r.data) router.push(`/obras/${r.data.id}`)
      else router.refresh()
    })
  }

  return (
    <Panel
      abierto={abierto}
      onCerrar={onCerrar}
      variante="hoja"
      titulo={existente ? 'Editar obra' : 'Cargar obra en curso'}
      descripcion={existente ? undefined : 'Para obras que ya estaban en marcha. Las nuevas nacen de un presupuesto ganado.'}
      pie={
        <>
          {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
          <Button variante="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="primary" onClick={guardar} cargando={pendiente}>
            {existente ? 'Guardar cambios' : 'Cargar obra'}
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
          <Field label="Cliente" htmlFor="o-cliente">
            <ClienteSelector id="o-cliente" opciones={opciones} valor={cliente} onChange={setCliente} />
          </Field>
        )}
        <div className="grid grid-cols-[1fr_auto] gap-3 sm:grid-cols-[1fr_180px]">
          <Field label="Obra o dirección" htmlFor="o-dir">
            <Input id="o-dir" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Mitre 2140, o el nombre del edificio" />
          </Field>
          <Field label="Localidad" htmlFor="o-loc" className="w-36 sm:w-auto">
            <Input id="o-loc" list="localidades-o" value={localidad} onChange={(e) => setLocalidad(e.target.value)} />
            <datalist id="localidades-o">
              {LOCALIDADES_SUGERIDAS.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Tipología" htmlFor="o-tipo">
            <Select id="o-tipo" value={tipologia} onChange={(e) => setTipologia(e.target.value)}>
              <option value="" disabled>
                Elegí una
              </option>
              {TIPOLOGIAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Equipos" htmlFor="o-cant">
            <Input id="o-cant" inputMode="numeric" value={cantidad} onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>
        {!existente && (
          <Field label="¿En qué etapa está hoy?" htmlFor="o-etapa" hint="Las anteriores quedan marcadas como completas.">
            <Select id="o-etapa" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
              {ETAPAS_OBRA.map((e, i) => (
                <option key={e} value={i + 1}>
                  {i + 1}. {e}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio de obra" htmlFor="o-inicio">
            <Input id="o-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Field>
          <Field label="Puesta en marcha estimada" htmlFor="o-fin">
            <Input id="o-fin" type="date" value={fin} onChange={(e) => setFin(e.target.value)} />
          </Field>
        </div>
        <CamposTecnicos valor={tecnicos} onChange={setTecnicos} />
        <Field label="Notas" htmlFor="o-notas">
          <Textarea id="o-notas" value={notas} onChange={(e) => setNotas(e.target.value)} rows={3} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Panel>
  )
}
