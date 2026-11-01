'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Panel } from '@/components/ui/panel'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { Segmentado } from '@/components/forms/segmentado'
import { CamposTecnicos } from '@/components/forms/tecnicos'
import { crearVersion } from '@/lib/actions/presupuestos'
import { TIPOLOGIAS, etiquetaPresupuesto, siguienteVersion } from '@/lib/dominio'
import type { Presupuesto } from '@/lib/db/schema'

const miles = (v: string) => {
  const d = v.replace(/\D/g, '')
  return d ? new Intl.NumberFormat('es-AR').format(Number(d)) : ''
}

/** Se monta sólo al abrirlo, así arranca siempre con los datos vigentes. */
export function NuevaVersion({ presupuesto: p, hoy, onCerrar }: { presupuesto: Presupuesto; hoy: string; onCerrar: () => void }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [error, setError] = useState<string>()
  const nueva = etiquetaPresupuesto({ ...p, version: siguienteVersion(p.version) })

  const [cambios, setCambios] = useState('')
  const [fechaEnvio, setFechaEnvio] = useState(hoy)
  const [monto, setMonto] = useState(p.monto != null ? miles(String(Math.round(p.monto))) : '')
  const [moneda, setMoneda] = useState<'ARS' | 'USD'>(p.moneda === 'ARS' ? 'ARS' : 'USD')
  const [tipologia, setTipologia] = useState(p.tipologia)
  const [cantidad, setCantidad] = useState(String(p.cantidadEquipos))
  const [tecnicos, setTecnicos] = useState({ cargaKg: p.cargaKg?.toString() ?? '', paradas: p.paradas?.toString() ?? '', velocidad: p.velocidad ?? '' })

  function guardar() {
    setError(undefined)
    start(async () => {
      const r = await crearVersion(p.id, { cambios, fechaEnvio, monto, moneda, tipologia, cantidadEquipos: cantidad, ...tecnicos })
      if (!r.ok) return setError(r.error)
      toast(`Versión ${nueva} creada`)
      onCerrar()
      router.refresh()
    })
  }

  return (
    <Panel
      abierto
      onCerrar={onCerrar}
      variante="hoja"
      titulo={`Nueva versión: ${nueva}`}
      descripcion={`Mismo número, con «-${siguienteVersion(p.version)}». La versión actual queda guardada tal como está.`}
      pie={
        <>
          {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
          <Button variante="ghost" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button variante="primary" onClick={guardar} cargando={pendiente}>
            Crear versión
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
        <Field label="¿Qué cambió?" htmlFor="v-cambios" hint="Lo que se agregó o se sacó. Queda en el historial del presupuesto.">
          <Textarea id="v-cambios" rows={3} value={cambios} onChange={(e) => setCambios(e.target.value)} placeholder="Se agregó un equipo, se sacó la obra civil, nuevo precio…" data-autofocus />
        </Field>
        <Field label="Fecha de envío de esta versión" htmlFor="v-envio">
          <Input id="v-envio" type="date" value={fechaEnvio} max={hoy} onChange={(e) => setFechaEnvio(e.target.value)} className="w-48" />
        </Field>
        <Field label="Monto" htmlFor="v-monto">
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
            <Input id="v-monto" inputMode="numeric" value={monto} onChange={(e) => setMonto(miles(e.target.value))} placeholder="0" className="tabular text-right font-medium" />
          </div>
        </Field>
        <div className="grid grid-cols-[1fr_96px] gap-3">
          <Field label="Tipología" htmlFor="v-tipo">
            <Select id="v-tipo" value={tipologia} onChange={(e) => setTipologia(e.target.value)}>
              {TIPOLOGIAS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Equipos" htmlFor="v-cant">
            <Input id="v-cant" inputMode="numeric" value={cantidad} onChange={(e) => setCantidad(e.target.value.replace(/\D/g, ''))} />
          </Field>
        </div>
        <CamposTecnicos valor={tecnicos} onChange={setTecnicos} />
        <button type="submit" hidden />
      </form>
    </Panel>
  )
}
