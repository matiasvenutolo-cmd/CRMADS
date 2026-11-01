'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MoreHorizontal, Pencil, Undo2, PartyPopper, ListOrdered, ClipboardCheck, HardHat } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuItem } from '@/components/ui/menu'
import { Panel } from '@/components/ui/panel'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { usePuedeEditar } from '@/components/shell/permisos'
import { cn } from '@/lib/utils'
import { ObraForm } from '@/components/forms/obra-form'
import { completarEtapa, fijarEtapaActual, fijarMontaje, verificarObraCivil, volverEtapa } from '@/lib/actions/obras'
import { Segmentado } from '@/components/forms/segmentado'
import { ETAPA, FECHA_DE_ETAPA } from '@/lib/dominio'
import { diferenciaDias, fechaCorta, relativo } from '@/lib/fechas'
import type { Etapa, Obra } from '@/lib/db/schema'

export function EtapaActual({ obra, etapas, hoy, montadores }: { obra: Obra; etapas: Etapa[]; hoy: string; montadores: string[] }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [modal, setModal] = useState<'completar' | 'editar' | 'cambiar' | 'montaje' | null>(null)
  const [civilOk, setCivilOk] = useState<'si' | 'no'>('si')
  const [inicioMontaje, setInicioMontaje] = useState('')
  const [montador, setMontador] = useState(obra.montador ?? '')
  const [destino, setDestino] = useState('1')
  const [fecha, setFecha] = useState(hoy)
  const [nota, setNota] = useState('')

  const total = etapas.length
  const actual = etapas.find((e) => e.estado === 'en_curso')
  const siguiente = actual ? etapas.find((e) => e.orden === actual.orden + 1) : undefined
  const terminada = obra.estado === 'terminada'
  const atrasada = !!actual?.fechaPrevista && actual.fechaPrevista < hoy
  const puedeEditar = usePuedeEditar()

  const esCivil = actual?.orden === ETAPA.civil
  const esMontaje = actual?.orden === ETAPA.montaje

  function completar() {
    if (!actual) return
    start(async () => {
      const r = esCivil ? await verificarObraCivil(obra.id, fecha, civilOk === 'si', nota) : await completarEtapa(obra.id, actual.id, fecha, nota)
      if (!r.ok) return toast(r.error, 'error')
      setModal(null)
      setNota('')
      toast(esCivil && civilOk === 'no' ? 'Verificación registrada' : r.data?.terminada ? '¡Obra terminada!' : `Etapa ${actual.orden} completa`)
      router.refresh()
    })
  }

  function guardarMontaje() {
    start(async () => {
      const r = await fijarMontaje(obra.id, { inicio: inicioMontaje, montador })
      if (!r.ok) return toast(r.error, 'error')
      setModal(null)
      toast('Datos del montaje guardados')
      router.refresh()
    })
  }

  function volver() {
    if (!confirm('¿Volver a la etapa anterior? Se deshace el último avance.')) return
    start(async () => {
      const r = await volverEtapa(obra.id)
      if (!r.ok) return toast(r.error, 'error')
      toast('Se volvió a la etapa anterior')
      router.refresh()
    })
  }

  return (
    <section className="relative overflow-hidden rounded-[20px] banda text-white">
      <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-end md:justify-between md:p-8">
        <div className="flex items-end gap-5 md:gap-7">
          <div className="flex items-start font-serif font-extrabold leading-[0.8] tracking-[-0.02em]">
            <span className="text-[88px] md:text-[112px]">{terminada ? '✓' : String(actual?.orden ?? total).padStart(2, '0')}</span>
            {!terminada && <span className="mt-2 text-[22px] text-white/35 md:text-[26px]">/{String(total).padStart(2, '0')}</span>}
          </div>
          <div className="min-w-0 pb-1.5">
            <p className="kicker kicker-claro">{terminada ? 'Obra terminada' : 'Etapa actual'}</p>
            <p className="mt-1.5 font-serif text-[30px] leading-[1.05] md:text-[38px]">{terminada ? 'Equipo puesto en marcha' : actual?.nombre}</p>
            <p className="mt-2 text-[13.5px] text-white/55">
              {terminada
                ? `Terminada el ${fechaCorta(obra.fechaFin)}`
                : [
                    actual?.fechaInicio && `En curso desde el ${fechaCorta(actual.fechaInicio)}`,
                    actual?.fechaPrevista && (atrasada ? null : `prevista ${relativo(actual.fechaPrevista)}`),
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Sin fechas cargadas'}
              {atrasada && <span className="ml-1 font-medium text-naranja">{actual?.fechaInicio ? '· ' : ''}Atrasada desde el {fechaCorta(actual!.fechaPrevista)}</span>}
            </p>
            {esMontaje && <p className="mt-1 text-[13.5px] text-white/75">{obra.montador ? `Montador: ${obra.montador}` : 'Sin montador asignado'}</p>}
            {terminada && obra.fechaFinEstimada && obra.fechaFin && (
              <p className="mt-1 text-[13.5px] text-white/75">
                Plazo pedido: {fechaCorta(obra.fechaFinEstimada)} ·{' '}
                {obra.fechaFin <= obra.fechaFinEstimada ? 'entregada en plazo' : `${diferenciaDias(obra.fechaFinEstimada, obra.fechaFin)} días después`}
              </p>
            )}
          </div>
        </div>

        <div className={cn('flex items-center gap-2', !puedeEditar && 'hidden')}>
          {esMontaje && (
            <button
              type="button"
              onClick={() => {
                setInicioMontaje(actual?.fechaInicio ?? '')
                setMontador(obra.montador ?? '')
                setModal('montaje')
              }}
              className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/25 px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-white/10"
            >
              <HardHat className="size-4" />
              Montador
            </button>
          )}
          {actual && (
            <button
              type="button"
              onClick={() => {
                setFecha(hoy)
                setCivilOk('si')
                setModal('completar')
              }}
              className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-[14.5px] font-medium text-ink transition-colors hover:bg-white/90 md:flex-none"
            >
              {esCivil ? (
                <>
                  <ClipboardCheck className="size-4" /> Verificar obra civil
                </>
              ) : (
                <>
                  {siguiente ? 'Completar etapa' : 'Completar y terminar obra'}
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          )}
          <Menu
            disparador={({ alternar }) => (
              <button type="button" onClick={alternar} aria-label="Más acciones" className="flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10">
                <MoreHorizontal className="size-5" />
              </button>
            )}
          >
            {(cerrar) => (
              <>
                <MenuItem icono={<Pencil />} onClick={() => (cerrar(), setModal('editar'))}>
                  Editar datos de la obra
                </MenuItem>
                <MenuItem
                  icono={<ListOrdered />}
                  onClick={() => {
                    cerrar()
                    setDestino(String(actual?.orden ?? total))
                    setModal('cambiar')
                  }}
                >
                  Cambiar etapa actual
                </MenuItem>
                {etapas.some((e) => e.estado === 'completa') && (
                  <MenuItem icono={<Undo2 />} onClick={() => (cerrar(), volver())}>
                    Volver a la etapa anterior
                  </MenuItem>
                )}
              </>
            )}
          </Menu>
        </div>
      </div>

      <Panel
        abierto={modal === 'completar'}
        onCerrar={() => setModal(null)}
        titulo={esCivil ? 'Verificar la obra civil' : `Completar «${actual?.nombre ?? ''}»`}
        descripcion={
          esCivil
            ? 'Cada verificación queda registrada. Si está lista, la obra pasa a la entrega de materiales.'
            : siguiente
              ? `La obra pasa a la etapa ${siguiente.orden}: ${siguiente.nombre}.`
              : 'Es la última etapa: la obra queda terminada.'
        }
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variante="accent" onClick={completar} cargando={pendiente}>
              {esCivil ? 'Guardar verificación' : siguiente ? 'Completar etapa' : (
                <>
                  <PartyPopper className="size-4" /> Terminar obra
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {esCivil && (
            <Field label="¿Está lista la obra civil?">
              <Segmentado
                etiqueta="¿Está lista la obra civil?"
                valor={civilOk}
                onChange={setCivilOk}
                opciones={[
                  { valor: 'si', label: 'Sí, está ok' },
                  { valor: 'no', label: 'No, todavía no' },
                ]}
                className="w-full"
              />
            </Field>
          )}
          <Field
            label={actual ? FECHA_DE_ETAPA[actual.orden] ?? '¿Cuándo se completó?' : '¿Cuándo se completó?'}
            htmlFor="ce-fecha"
            hint={actual?.orden === ETAPA.pruebas ? 'Acordate de subir el acta de entrega firmada, abajo en «Acta de entrega».' : undefined}
          >
            <Input id="ce-fecha" type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} className="w-48" />
          </Field>
          <Field label="Comentario" htmlFor="ce-nota" hint="Opcional. Queda en la bitácora de la obra.">
            <Textarea id="ce-nota" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel
        abierto={modal === 'cambiar'}
        onCerrar={() => setModal(null)}
        titulo="Cambiar etapa actual"
        descripcion="Para ubicar la obra en la etapa en la que realmente está. Las anteriores quedan completas y las siguientes, pendientes."
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button
              variante="primary"
              cargando={pendiente}
              onClick={() =>
                start(async () => {
                  const r = await fijarEtapaActual(obra.id, Number(destino))
                  if (!r.ok) return toast(r.error, 'error')
                  setModal(null)
                  toast(`Obra en la etapa ${destino}`)
                  router.refresh()
                })
              }
            >
              Guardar
            </Button>
          </>
        }
      >
        <Field label="Etapa actual" htmlFor="cambiar-etapa">
          <Select id="cambiar-etapa" value={destino} onChange={(e) => setDestino(e.target.value)}>
            {etapas.map((e) => (
              <option key={e.id} value={e.orden}>
                {e.orden}. {e.nombre}
              </option>
            ))}
          </Select>
        </Field>
      </Panel>

      <Panel
        abierto={modal === 'montaje'}
        onCerrar={() => setModal(null)}
        titulo="Datos del montaje"
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variante="primary" onClick={guardarMontaje} cargando={pendiente}>
              Guardar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Inicio del montaje" htmlFor="m-inicio">
            <Input id="m-inicio" type="date" value={inicioMontaje} onChange={(e) => setInicioMontaje(e.target.value)} className="w-48" />
          </Field>
          <Field label="Montador" htmlFor="m-montador" hint="Quién está a cargo del montaje.">
            <Input id="m-montador" list="montadores-m" value={montador} onChange={(e) => setMontador(e.target.value)} data-autofocus />
            <datalist id="montadores-m">
              {montadores.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </Field>
        </div>
      </Panel>

      {modal === 'editar' && <ObraForm abierto onCerrar={() => setModal(null)} opciones={[]} hoy={hoy} existente={obra} montadores={montadores} />}
    </section>
  )
}
