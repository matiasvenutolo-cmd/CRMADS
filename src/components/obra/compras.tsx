'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { Field, Input } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { Aviso } from '@/components/ui/estado'
import { usePuedeEditar } from '@/components/shell/permisos'
import { eliminarCompra, guardarCompra } from '@/lib/actions/compras'
import { fechaCorta } from '@/lib/fechas'
import type { Compra } from '@/lib/db/schema'

const VACIA = { proveedor: '', detalle: '', compraPrevista: '', fechaCompra: '', finProduccion: '' }

/** Estado de una compra en una línea: lo que Gerardo quiere ver de un vistazo. */
export function estadoCompra(c: Pick<Compra, 'compraPrevista' | 'fechaCompra' | 'finProduccion'>, hoy: string) {
  if (!c.fechaCompra) {
    if (!c.compraPrevista) return { texto: 'Sin fecha de compra', tono: 'neutro' as const }
    return c.compraPrevista < hoy ? { texto: `Comprar: vencido el ${fechaCorta(c.compraPrevista)}`, tono: 'warn' as const } : { texto: `Comprar antes del ${fechaCorta(c.compraPrevista)}`, tono: 'accent' as const }
  }
  if (c.finProduccion) return { texto: `Comprado el ${fechaCorta(c.fechaCompra)} · producción lista ~${fechaCorta(c.finProduccion)}`, tono: 'ok' as const }
  return { texto: `Comprado el ${fechaCorta(c.fechaCompra)}`, tono: 'ok' as const }
}

export function Compras({ obraId, compras, proveedores, hoy }: { obraId: string; compras: Compra[]; proveedores: string[]; hoy: string }) {
  const router = useRouter()
  const toast = useToast()
  const puedeEditar = usePuedeEditar()
  const [pendiente, start] = useTransition()
  const [editando, setEditando] = useState<Compra | 'nueva' | null>(null)
  const [f, setF] = useState(VACIA)
  const [error, setError] = useState<string>()

  function abrir(c: Compra | 'nueva') {
    setError(undefined)
    setF(c === 'nueva' ? VACIA : { proveedor: c.proveedor, detalle: c.detalle ?? '', compraPrevista: c.compraPrevista ?? '', fechaCompra: c.fechaCompra ?? '', finProduccion: c.finProduccion ?? '' })
    setEditando(c)
  }

  function guardar() {
    setError(undefined)
    start(async () => {
      const r = await guardarCompra(obraId, editando === 'nueva' || !editando ? null : editando.id, f)
      if (!r.ok) return setError(r.error)
      setEditando(null)
      toast('Compra guardada')
      router.refresh()
    })
  }

  function borrar() {
    if (editando === 'nueva' || !editando || !confirm(`¿Eliminar la compra a ${editando.proveedor}?`)) return
    start(async () => {
      const r = await eliminarCompra(obraId, editando.id)
      if (!r.ok) return setError(r.error)
      setEditando(null)
      toast('Compra eliminada')
      router.refresh()
    })
  }

  return (
    <div>
      {compras.length === 0 ? (
        <p className="mb-4 text-[13.5px] text-ink-3">Todavía no hay compras cargadas para esta obra.</p>
      ) : (
        <ul className="mb-4 divide-y divide-line rounded-control border border-line">
          {compras.map((c) => {
            const e = estadoCompra(c, hoy)
            const contenido = (
              <>
                <span className="block text-[14.5px] font-medium text-ink">{c.proveedor}</span>
                {c.detalle && <span className="block text-[13px] text-ink-2">{c.detalle}</span>}
                <span className="mt-1.5 block">
                  <Aviso tono={e.tono}>{e.texto}</Aviso>
                </span>
              </>
            )
            return (
              <li key={c.id}>
                {puedeEditar ? (
                  <button type="button" onClick={() => abrir(c)} className="block w-full cursor-pointer px-3.5 py-3 text-left transition-colors hover:bg-subtle">
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

      {puedeEditar && compras.length < 10 && (
        <Button variante="secondary" onClick={() => abrir('nueva')}>
          <Plus className="size-4" />
          Agregar proveedor
        </Button>
      )}

      <Panel
        abierto={editando !== null}
        onCerrar={() => setEditando(null)}
        titulo={editando === 'nueva' ? 'Nueva compra' : 'Editar compra'}
        pie={
          <>
            {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
            {editando !== 'nueva' && (
              <Button variante="ghost" onClick={borrar} className="mr-auto text-bad" aria-label="Eliminar compra">
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
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            guardar()
          }}
        >
          <Field label="Proveedor" htmlFor="c-prov">
            <Input id="c-prov" list="proveedores" value={f.proveedor} onChange={(e) => setF({ ...f, proveedor: e.target.value })} data-autofocus />
            <datalist id="proveedores">
              {proveedores.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </Field>
          <Field label="Qué se le compra" htmlFor="c-det" hint="Opcional. Por ejemplo: máquina, guías, cabina, puertas.">
            <Input id="c-det" value={f.detalle} onChange={(e) => setF({ ...f, detalle: e.target.value })} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Comprar antes del" htmlFor="c-prev">
              <Input id="c-prev" type="date" value={f.compraPrevista} onChange={(e) => setF({ ...f, compraPrevista: e.target.value })} />
            </Field>
            <Field label="Comprado el" htmlFor="c-real" hint="Vacío si todavía no.">
              <Input id="c-real" type="date" value={f.fechaCompra} max={hoy} onChange={(e) => setF({ ...f, fechaCompra: e.target.value })} />
            </Field>
          </div>
          <Field label="Fin de producción previsto" htmlFor="c-fin" hint="La fecha que da el proveedor.">
            <Input id="c-fin" type="date" value={f.finProduccion} onChange={(e) => setF({ ...f, finProduccion: e.target.value })} className="w-48" />
          </Field>
          <button type="submit" hidden />
        </form>
      </Panel>
    </div>
  )
}
