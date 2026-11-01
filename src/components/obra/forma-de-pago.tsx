'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { Aviso } from '@/components/ui/estado'
import { Segmentado } from '@/components/forms/segmentado'
import { usePuedeEditar } from '@/components/shell/permisos'
import { eliminarPago, guardarPago } from '@/lib/actions/pagos'
import { ETAPAS_OBRA, MEDIOS_PAGO } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { estadoPago, type EstadoPago } from '@/lib/pagos'
import type { Etapa, Pago } from '@/lib/db/schema'

const TONO: Record<EstadoPago, 'ok' | 'warn' | 'accent' | 'neutro'> = { cobrado: 'ok', vencido: 'warn', a_cobrar: 'accent', sujeto: 'neutro', sin_fecha: 'neutro' }
const VACIO = { concepto: '', medio: '', monto: '', moneda: 'ARS' as 'ARS' | 'USD', vence: 'fecha' as 'fecha' | 'etapa', fechaPrevista: '', etapaOrden: '', fechaCobro: '', notas: '' }

const miles = (v: string) => {
  const d = v.replace(/\D/g, '')
  return d ? new Intl.NumberFormat('es-AR').format(Number(d)) : ''
}

export function FormaDePago({ obraId, pagos, etapas, hoy, presupuestado }: { obraId: string; pagos: Pago[]; etapas: Etapa[]; hoy: string; presupuestado: { monto: number | null; moneda: string } | null }) {
  const router = useRouter()
  const toast = useToast()
  const puedeEditar = usePuedeEditar()
  const [pendiente, start] = useTransition()
  const [editando, setEditando] = useState<Pago | 'nuevo' | null>(null)
  const [f, setF] = useState(VACIO)
  const [error, setError] = useState<string>()

  const totales = (['USD', 'ARS'] as const)
    .map((moneda) => {
      const l = pagos.filter((p) => p.moneda === moneda)
      const pactado = l.reduce((t, p) => t + (p.monto ?? 0), 0)
      const cobrado = l.filter((p) => p.fechaCobro).reduce((t, p) => t + (p.monto ?? 0), 0)
      return { moneda, n: l.length, pactado, cobrado }
    })
    .filter((t) => t.n > 0)

  function abrir(p: Pago | 'nuevo') {
    setError(undefined)
    setF(
      p === 'nuevo'
        ? VACIO
        : {
            concepto: p.concepto,
            medio: p.medio ?? '',
            monto: p.monto != null ? miles(String(Math.round(p.monto))) : '',
            moneda: p.moneda === 'USD' ? 'USD' : 'ARS',
            vence: p.etapaOrden ? 'etapa' : 'fecha',
            fechaPrevista: p.fechaPrevista ?? '',
            etapaOrden: p.etapaOrden ? String(p.etapaOrden) : '',
            fechaCobro: p.fechaCobro ?? '',
            notas: p.notas ?? '',
          }
    )
    setEditando(p)
  }

  function guardar() {
    setError(undefined)
    const datos = {
      ...f,
      fechaPrevista: f.vence === 'fecha' ? f.fechaPrevista : '',
      etapaOrden: f.vence === 'etapa' ? f.etapaOrden : '',
    }
    start(async () => {
      const r = await guardarPago(obraId, editando === 'nuevo' || !editando ? null : editando.id, datos)
      if (!r.ok) return setError(r.error)
      setEditando(null)
      toast('Pago guardado')
      router.refresh()
    })
  }

  function borrar() {
    if (editando === 'nuevo' || !editando || !confirm(`¿Eliminar «${editando.concepto}»?`)) return
    start(async () => {
      const r = await eliminarPago(obraId, editando.id)
      if (!r.ok) return setError(r.error)
      setEditando(null)
      toast('Pago eliminado')
      router.refresh()
    })
  }

  return (
    <div>
      {totales.length > 0 && (
        <dl className="mb-4 grid gap-3 sm:grid-cols-2">
          {totales.map((t) => (
            <div key={t.moneda} className="rounded-control bg-subtle px-3.5 py-3">
              <dt className="text-[12.5px] text-ink-3">{t.moneda === 'USD' ? 'En dólares' : 'En pesos'}</dt>
              <dd className="mt-1 font-serif text-[22px] leading-none text-ink">{dinero(t.pactado, t.moneda)}</dd>
              <dd className="mt-1.5 text-[12.5px] text-ink-3">
                Cobrado {dinero(t.cobrado, t.moneda)} · saldo <span className="font-medium text-ink-2">{dinero(t.pactado - t.cobrado, t.moneda)}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
      {presupuestado?.monto != null && <p className="mb-3 text-[12.5px] text-ink-3">Presupuestado: {dinero(presupuestado.monto, presupuestado.moneda)}</p>}

      {pagos.length === 0 ? (
        <p className="mb-4 text-[13.5px] text-ink-3">Todavía no se cargó la forma de pago. Puede ser cualquier combinación: anticipo, cuotas, canje…</p>
      ) : (
        <ul className="mb-4 divide-y divide-line rounded-control border border-line">
          {pagos.map((p) => {
            const e = estadoPago(p, etapas, hoy)
            const contenido = (
              <>
                <span className="flex items-baseline justify-between gap-3">
                  <span className="text-[14.5px] font-medium text-ink">{p.concepto}</span>
                  <span className="tabular shrink-0 text-[14px] font-medium text-ink">{p.monto != null ? dinero(p.monto, p.moneda) : 'Sin monto'}</span>
                </span>
                {(p.medio || p.notas) && <span className="block text-[13px] text-ink-3">{[p.medio, p.notas].filter(Boolean).join(' · ')}</span>}
                <span className="mt-1.5 block">
                  <Aviso tono={TONO[e.estado]}>{e.texto}</Aviso>
                </span>
              </>
            )
            return (
              <li key={p.id}>
                {puedeEditar ? (
                  <button type="button" onClick={() => abrir(p)} className="block w-full cursor-pointer px-3.5 py-3 text-left transition-colors hover:bg-subtle">
                    {contenido}
                  </button>
                ) : (
                  <div className="px-3.5 py-3">{contenido}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {puedeEditar && (
        <Button variante="secondary" onClick={() => abrir('nuevo')}>
          <Plus className="size-4" />
          Agregar pago
        </Button>
      )}

      <Panel
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        variante="hoja"
        titulo={editando === 'nuevo' ? 'Nuevo pago' : 'Editar pago'}
        descripcion="Se puede cambiar en cualquier momento, también después de la entrega."
        pie={
          <>
            {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
            {editando !== 'nuevo' && (
              <Button variante="ghost" onClick={borrar} className="mr-auto text-bad" aria-label="Eliminar pago">
                <Trash2 className="size-4" />
              </Button>
            )}
            <Button variante="ghost" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button variante="primary" onClick={guardar} cargando={pendiente}>
              Guardar
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
          <div className="grid grid-cols-[1fr_150px] gap-3">
            <Field label="Concepto" htmlFor="pg-concepto">
              <Input id="pg-concepto" value={f.concepto} onChange={(e) => setF({ ...f, concepto: e.target.value })} placeholder="Anticipo, Cuota 2, Canje depto…" data-autofocus />
            </Field>
            <Field label="Medio" htmlFor="pg-medio">
              <Select id="pg-medio" value={f.medio} onChange={(e) => setF({ ...f, medio: e.target.value })}>
                <option value="">—</option>
                {MEDIOS_PAGO.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field label="Monto" htmlFor="pg-monto" hint={f.medio === 'Canje' ? 'El valor acordado del canje.' : undefined}>
            <div className="flex gap-2">
              <Segmentado
                etiqueta="Moneda"
                valor={f.moneda}
                onChange={(moneda) => setF({ ...f, moneda })}
                opciones={[
                  { valor: 'ARS', label: '$' },
                  { valor: 'USD', label: 'US$' },
                ]}
                className="shrink-0"
              />
              <Input id="pg-monto" inputMode="numeric" value={f.monto} onChange={(e) => setF({ ...f, monto: miles(e.target.value) })} placeholder="0" className="tabular text-right font-medium" />
            </div>
          </Field>
          <Field label="¿Cuándo se cobra?">
            <Segmentado
              etiqueta="¿Cuándo se cobra?"
              valor={f.vence}
              onChange={(vence) => setF({ ...f, vence })}
              opciones={[
                { valor: 'fecha', label: 'En una fecha' },
                { valor: 'etapa', label: 'Al completar una etapa' },
              ]}
              className="w-full"
            />
          </Field>
          {f.vence === 'fecha' ? (
            <Field label="Fecha prevista" htmlFor="pg-fecha">
              <Input id="pg-fecha" type="date" value={f.fechaPrevista} onChange={(e) => setF({ ...f, fechaPrevista: e.target.value })} className="w-48" />
            </Field>
          ) : (
            <Field label="Etapa" htmlFor="pg-etapa" hint="Vence el día en que se completa esa etapa.">
              <Select id="pg-etapa" value={f.etapaOrden} onChange={(e) => setF({ ...f, etapaOrden: e.target.value })}>
                <option value="" disabled>
                  Elegí la etapa
                </option>
                {ETAPAS_OBRA.map((e, i) => (
                  <option key={e} value={i + 1}>
                    {i + 1}. {e}
                  </option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Cobrado el" htmlFor="pg-cobro" hint="Vacío mientras no se cobre.">
            <Input id="pg-cobro" type="date" value={f.fechaCobro} max={hoy} onChange={(e) => setF({ ...f, fechaCobro: e.target.value })} className="w-48" />
          </Field>
          <Field label="Notas" htmlFor="pg-notas">
            <Textarea id="pg-notas" rows={2} value={f.notas} onChange={(e) => setF({ ...f, notas: e.target.value })} placeholder="Tipo de cambio, condiciones, lo que haga falta recordar." />
          </Field>
          <button type="submit" hidden />
        </form>
      </Panel>
    </div>
  )
}
