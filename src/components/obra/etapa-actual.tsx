'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, MoreHorizontal, Pencil, Undo2, PartyPopper, ListOrdered } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuItem } from '@/components/ui/menu'
import { Panel } from '@/components/ui/panel'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { ObraForm } from '@/components/forms/obra-form'
import { completarEtapa, fijarEtapaActual, volverEtapa } from '@/lib/actions/obras'
import { fechaCorta, relativo } from '@/lib/fechas'
import type { Etapa, Obra } from '@/lib/db/schema'

export function EtapaActual({ obra, etapas, hoy }: { obra: Obra; etapas: Etapa[]; hoy: string }) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [modal, setModal] = useState<'completar' | 'editar' | 'cambiar' | null>(null)
  const [destino, setDestino] = useState('1')
  const [fecha, setFecha] = useState(hoy)
  const [nota, setNota] = useState('')

  const total = etapas.length
  const actual = etapas.find((e) => e.estado === 'en_curso')
  const siguiente = actual ? etapas.find((e) => e.orden === actual.orden + 1) : undefined
  const terminada = obra.estado === 'terminada'
  const atrasada = !!actual?.fechaPrevista && actual.fechaPrevista < hoy

  function completar() {
    if (!actual) return
    start(async () => {
      const r = await completarEtapa(obra.id, actual.id, fecha, nota)
      if (!r.ok) return toast(r.error, 'error')
      setModal(null)
      setNota('')
      toast(r.data?.terminada ? '¡Obra terminada!' : `Etapa ${actual.orden} completa`)
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
          </div>
        </div>

        <div className="flex items-center gap-2">
          {actual && (
            <button
              type="button"
              onClick={() => {
                setFecha(hoy)
                setModal('completar')
              }}
              className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-6 text-[14.5px] font-medium text-ink transition-colors hover:bg-white/90 md:flex-none"
            >
              {siguiente ? 'Completar etapa' : 'Completar y terminar obra'}
              <ArrowRight className="size-4" />
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
        titulo={`Completar «${actual?.nombre ?? ''}»`}
        descripcion={siguiente ? `La obra pasa a la etapa ${siguiente.orden}: ${siguiente.nombre}.` : 'Es la última etapa: la obra queda terminada.'}
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variante="accent" onClick={completar} cargando={pendiente}>
              {siguiente ? 'Completar etapa' : (
                <>
                  <PartyPopper className="size-4" /> Terminar obra
                </>
              )}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="¿Cuándo se completó?" htmlFor="ce-fecha">
            <Input id="ce-fecha" type="date" value={fecha} max={hoy} onChange={(e) => setFecha(e.target.value)} />
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

      {modal === 'editar' && <ObraForm abierto onCerrar={() => setModal(null)} opciones={[]} hoy={hoy} existente={obra} />}
    </section>
  )
}
