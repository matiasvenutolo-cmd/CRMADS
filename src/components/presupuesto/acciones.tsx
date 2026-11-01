'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, MoreHorizontal, Pencil, RotateCcw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Menu, MenuItem } from '@/components/ui/menu'
import { Panel } from '@/components/ui/panel'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { Punto } from '@/components/ui/estado'
import { usePuedeEditar } from '@/components/shell/permisos'
import { PresupuestoForm } from '@/components/forms/presupuesto-form'
import { cambiarEstado, ganarYCrearObra, marcarPerdido, reabrirPresupuesto } from '@/lib/actions/presupuestos'
import { opcionesDeClientes } from '@/lib/actions/clientes'
import { ESTADOS_PRESUPUESTO, ETAPAS_OBRA, MOTIVOS_PERDIDA, type EstadoPresupuesto } from '@/lib/dominio'
import type { Presupuesto } from '@/lib/db/schema'

type Props = { presupuesto: Presupuesto & { clienteNombre: string }; hoy: string }

export function SelectorEstado({ presupuesto }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const e = ESTADOS_PRESUPUESTO[presupuesto.estado as EstadoPresupuesto]
  const puedeEditar = usePuedeEditar()
  if (!['borrador', 'enviado', 'negociacion'].includes(presupuesto.estado)) return null
  if (!puedeEditar)
    return (
      <span className="flex h-8 items-center gap-2 text-[13px] font-medium text-ink">
        <Punto color={e.color} />
        {e.label}
      </span>
    )

  return (
    <Menu
      alinear="izquierda"
      disparador={({ alternar, abierto }) => (
        <button
          type="button"
          onClick={alternar}
          aria-expanded={abierto}
          disabled={pendiente}
          className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-line-strong bg-surface pl-3 pr-2.5 text-[13px] font-medium text-ink transition-colors hover:border-ink/30"
        >
          <Punto color={e.color} />
          {e.label}
          <ChevronDown className="size-3.5 text-ink-3" />
        </button>
      )}
    >
      {(cerrar) =>
        (['borrador', 'enviado', 'negociacion'] as const).map((k) => (
          <MenuItem
            key={k}
            icono={<Punto color={ESTADOS_PRESUPUESTO[k].color} />}
            onClick={() => {
              cerrar()
              if (k === presupuesto.estado) return
              start(async () => {
                const r = await cambiarEstado(presupuesto.id, k)
                if (!r.ok) return toast(r.error, 'error')
                router.refresh()
              })
            }}
          >
            {ESTADOS_PRESUPUESTO[k].label}
          </MenuItem>
        ))
      }
    </Menu>
  )
}

export function AccionesPresupuesto({ presupuesto, hoy }: Props) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const [modal, setModal] = useState<'ganar' | 'perder' | 'editar' | null>(null)
  const [opciones, setOpciones] = useState<{ id: string; nombre: string }[]>([])
  const [aprobacion, setAprobacion] = useState(hoy)
  const [inicio, setInicio] = useState(hoy)
  const [fin, setFin] = useState('')
  const [etapa, setEtapa] = useState('1')
  const [motivo, setMotivo] = useState('')
  const [nota, setNota] = useState('')
  const activo = ['borrador', 'enviado', 'negociacion'].includes(presupuesto.estado)
  const puedeEditar = usePuedeEditar()

  const ganar = () =>
    start(async () => {
      const r = await ganarYCrearObra(presupuesto.id, { fechaAprobacion: aprobacion, fechaInicio: inicio, fechaFinEstimada: fin, etapaActual: Number(etapa) })
      if (!r.ok) return toast(r.error, 'error')
      toast('¡Ganado! La obra ya está en marcha')
      router.push(`/obras/${r.data!.obraId}`)
    })
  const perder = () =>
    start(async () => {
      const r = await marcarPerdido(presupuesto.id, motivo, nota)
      if (!r.ok) return toast(r.error, 'error')
      setModal(null)
      toast('Marcado como perdido')
      router.refresh()
    })
  const reabrir = () =>
    start(async () => {
      await reabrirPresupuesto(presupuesto.id)
      toast('Presupuesto reabierto')
      router.refresh()
    })

  if (!puedeEditar) return null
  return (
    <>
      {activo && (
        <>
          <Button variante="secondary" onClick={() => setModal('perder')}>
            <X className="size-4" />
            Perdido
          </Button>
          <Button variante="accent" onClick={() => setModal('ganar')}>
            <Check className="size-4" />
            Ganado, crear obra
          </Button>
        </>
      )}
      <Menu
        disparador={({ alternar }) => (
          <Button variante="ghost" tamano="icon" onClick={alternar} aria-label="Más acciones">
            <MoreHorizontal className="size-[18px]" />
          </Button>
        )}
      >
        {(cerrar) => (
          <>
            <MenuItem
              icono={<Pencil />}
              onClick={() => {
                cerrar()
                opcionesDeClientes().then(setOpciones)
                setModal('editar')
              }}
            >
              Editar datos
            </MenuItem>
            {presupuesto.estado === 'perdido' && (
              <MenuItem icono={<RotateCcw />} onClick={() => (cerrar(), reabrir())}>
                Reabrir presupuesto
              </MenuItem>
            )}
          </>
        )}
      </Menu>

      <Panel
        abierto={modal === 'ganar'}
        onCerrar={() => setModal(null)}
        titulo="¡Presupuesto ganado!"
        descripcion="Se crea la obra con los datos del presupuesto."
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variante="accent" onClick={ganar} cargando={pendiente}>
              Crear obra
            </Button>
          </>
        }
      >
        <Field label="Fecha de aprobación" htmlFor="g-aprob" hint="El día que el cliente aprobó el presupuesto." className="mb-4">
          <Input id="g-aprob" type="date" value={aprobacion} max={hoy} onChange={(e) => setAprobacion(e.target.value)} className="w-48" />
        </Field>
        <Field label="¿En qué etapa está la obra?" htmlFor="g-etapa" hint="Si recién arranca, dejala en la 1. Las anteriores quedan completas." className="mb-4">
          <Select id="g-etapa" value={etapa} onChange={(e) => setEtapa(e.target.value)}>
            {ETAPAS_OBRA.map((e, i) => (
              <option key={e} value={i + 1}>
                {i + 1}. {e}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Inicio de obra" htmlFor="g-inicio">
            <Input id="g-inicio" type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
          </Field>
          <Field label="Plazo de entrega pedido" htmlFor="g-fin" hint="Opcional. El que pidió el cliente.">
            <Input id="g-fin" type="date" value={fin} min={inicio} onChange={(e) => setFin(e.target.value)} />
          </Field>
        </div>
      </Panel>

      <Panel
        abierto={modal === 'perder'}
        onCerrar={() => setModal(null)}
        titulo="Marcar como perdido"
        descripcion="El motivo sirve para entender después por qué se pierden presupuestos."
        pie={
          <>
            <Button variante="ghost" onClick={() => setModal(null)}>
              Cancelar
            </Button>
            <Button variante="primary" onClick={perder} cargando={pendiente} disabled={!motivo}>
              Marcar perdido
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <Field label="Motivo" htmlFor="pe-motivo">
            <Select id="pe-motivo" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
              <option value="" disabled>
                Elegí el motivo
              </option>
              {MOTIVOS_PERDIDA.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field label="Comentario" htmlFor="pe-nota" hint="Opcional">
            <Textarea id="pe-nota" rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Ej: eligieron a otra empresa por US$ 4.000 menos" />
          </Field>
        </div>
      </Panel>

      {modal === 'editar' && <PresupuestoForm abierto onCerrar={() => setModal(null)} opciones={opciones} hoy={hoy} existente={presupuesto} />}
    </>
  )
}
