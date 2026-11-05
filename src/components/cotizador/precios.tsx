'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { Segmentado } from '@/components/forms/segmentado'
import { usePuedeEditar } from '@/components/shell/permisos'
import { archivarItem, eliminarBase, guardarBase, guardarItem, guardarParametros, guardarTexto } from '@/lib/actions/cotizador'
import { CATEGORIAS, TIPOS_EQUIPO } from '@/lib/cotizador/modelo'
import type { Catalogo } from '@/lib/cotizador/nueva'
import { cn } from '@/lib/utils'

type Pestana = 'items' | 'bases' | 'textos' | 'parametros'
const usd = (v: number) => `US$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(v)}`

export function PreciosYTextos({ catalogo }: { catalogo: Catalogo }) {
  const [pestana, setPestana] = useState<Pestana>('items')
  return (
    <div>
      <Segmentado
        etiqueta="Sección"
        valor={pestana}
        onChange={setPestana}
        opciones={[
          { valor: 'items', label: `Catálogo de costos · ${catalogo.items.filter((i) => i.activo).length}` },
          { valor: 'bases', label: `Precios de lista · ${catalogo.bases.length}` },
          { valor: 'textos', label: `Textos · ${catalogo.textos.length}` },
          { valor: 'parametros', label: 'Parámetros' },
        ]}
        className="mb-5 max-w-full overflow-x-auto"
      />
      {pestana === 'items' && <Items catalogo={catalogo} />}
      {pestana === 'bases' && <Bases catalogo={catalogo} />}
      {pestana === 'textos' && <Textos catalogo={catalogo} />}
      {pestana === 'parametros' && <Parametros catalogo={catalogo} />}
    </div>
  )
}

function useAccion() {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const correr = (fn: () => Promise<{ ok: boolean; error?: string }>, ok = 'Guardado') =>
    start(async () => {
      const r = await fn()
      if (!r.ok) return toast(r.error ?? 'No se pudo guardar', 'error')
      toast(ok)
      router.refresh()
    })
  return { pendiente, correr }
}

function Items({ catalogo }: { catalogo: Catalogo }) {
  const puede = usePuedeEditar()
  const { pendiente, correr } = useAccion()
  const [nuevo, setNuevo] = useState({ categoria: 'adicional', nombre: '', costo: '' })
  return (
    <div className="rounded-surface border border-line bg-surface shadow-surface">
      <p className="border-b border-line px-5 py-3 text-[13px] text-ink-3">Costos en dólares, por unidad. Los que se cambian acá se usan en las cotizaciones nuevas; las ya armadas no cambian.</p>
      {Object.entries(CATEGORIAS).map(([k, v]) => {
        const del = catalogo.items.filter((i) => i.categoria === k)
        if (!del.length) return null
        return (
          <div key={k}>
            <p className="bg-subtle px-5 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{v}</p>
            <ul className="divide-y divide-line">
              {del.map((i) => (
                <FilaItem key={i.id} item={i} puede={puede} pendiente={pendiente} correr={correr} />
              ))}
            </ul>
          </div>
        )
      })}
      {puede && (
        <form
          className="grid gap-2 border-t border-line px-5 py-4 sm:grid-cols-[160px_1fr_130px_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            correr(() => guardarItem(null, nuevo), 'Ítem agregado')
            setNuevo({ ...nuevo, nombre: '', costo: '' })
          }}
        >
          <Select aria-label="Categoría" value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}>
            {Object.entries(CATEGORIAS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input aria-label="Nombre" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} placeholder="Nuevo ítem" />
          <Input aria-label="Costo" inputMode="decimal" value={nuevo.costo} onChange={(e) => setNuevo({ ...nuevo, costo: e.target.value })} placeholder="Costo US$" className="text-right" />
          <Button type="submit" variante="secondary" disabled={pendiente || !nuevo.nombre}>
            <Plus className="size-4" /> Agregar
          </Button>
        </form>
      )}
    </div>
  )
}

function FilaItem({ item, puede, pendiente, correr }: { item: Catalogo['items'][number]; puede: boolean; pendiente: boolean; correr: ReturnType<typeof useAccion>['correr'] }) {
  const [nombre, setNombre] = useState(item.nombre)
  const [costo, setCosto] = useState(String(item.costo))
  const cambio = nombre !== item.nombre || Number(costo.replace(',', '.')) !== item.costo
  return (
    <li className={cn('grid grid-cols-[1fr_130px_auto] items-center gap-2 px-5 py-2', !item.activo && 'opacity-50')}>
      <input aria-label="Nombre" disabled={!puede} value={nombre} onChange={(e) => setNombre(e.target.value)} className="h-9 rounded-[7px] bg-transparent px-2 -ml-2 text-[14px] text-ink hover:bg-subtle focus:bg-subtle focus:outline-none" />
      <input aria-label="Costo" disabled={!puede} inputMode="decimal" value={costo} onChange={(e) => setCosto(e.target.value)} className="h-9 rounded-[7px] bg-transparent px-2 text-right tabular text-[14px] text-ink hover:bg-subtle focus:bg-subtle focus:outline-none" />
      {puede ? (
        cambio ? (
          <Button tamano="sm" variante="primary" disabled={pendiente} onClick={() => correr(() => guardarItem(item.id, { categoria: item.categoria, nombre, costo }))}>
            Guardar
          </Button>
        ) : (
          <Button tamano="sm" variante="ghost" disabled={pendiente} onClick={() => correr(() => archivarItem(item.id, !item.activo), item.activo ? 'Ítem archivado' : 'Ítem activado')}>
            {item.activo ? 'Archivar' : 'Activar'}
          </Button>
        )
      ) : (
        <span className="text-[13px] text-ink-3">{usd(item.costo)}</span>
      )}
    </li>
  )
}

function Bases({ catalogo }: { catalogo: Catalogo }) {
  const puede = usePuedeEditar()
  const { pendiente, correr } = useAccion()
  const [nuevo, setNuevo] = useState({ tipo: 'electromecanico', paradas: '', precio: '', detalle: '', fuente: '' })
  return (
    <div className="rounded-surface border border-line bg-surface shadow-surface">
      <p className="border-b border-line px-5 py-3 text-[13px] text-ink-3">
        Precio de lista del proveedor por equipo, antes del descuento. Se cargaron los últimos usados en cada presupuesto (la referencia dice de cuál salió). Cuando llegue una lista nueva de Wittur, se actualiza acá.
      </p>
      {Object.entries(TIPOS_EQUIPO).map(([k, v]) => {
        const del = catalogo.bases.filter((b) => b.tipo === k)
        if (!del.length) return null
        return (
          <div key={k}>
            <p className="bg-subtle px-5 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">{v}</p>
            <ul className="divide-y divide-line">
              {del.map((b) => (
                <FilaBase key={b.id} base={b} puede={puede} pendiente={pendiente} correr={correr} />
              ))}
            </ul>
          </div>
        )
      })}
      {puede && (
        <form
          className="grid gap-2 border-t border-line px-5 py-4 sm:grid-cols-[170px_90px_130px_1fr_auto]"
          onSubmit={(e) => {
            e.preventDefault()
            correr(() => guardarBase(null, nuevo), 'Precio agregado')
            setNuevo({ ...nuevo, paradas: '', precio: '', detalle: '' })
          }}
        >
          <Select aria-label="Tipo" value={nuevo.tipo} onChange={(e) => setNuevo({ ...nuevo, tipo: e.target.value })}>
            {Object.entries(TIPOS_EQUIPO).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
          <Input aria-label="Paradas" inputMode="numeric" value={nuevo.paradas} onChange={(e) => setNuevo({ ...nuevo, paradas: e.target.value })} placeholder="Paradas" />
          <Input aria-label="Precio" inputMode="decimal" value={nuevo.precio} onChange={(e) => setNuevo({ ...nuevo, precio: e.target.value })} placeholder="Precio US$" className="text-right" />
          <Input aria-label="Detalle" value={nuevo.detalle} onChange={(e) => setNuevo({ ...nuevo, detalle: e.target.value })} placeholder="Recorrido, modelo, lista…" />
          <Button type="submit" variante="secondary" disabled={pendiente || !nuevo.paradas || !nuevo.precio}>
            <Plus className="size-4" /> Agregar
          </Button>
        </form>
      )}
    </div>
  )
}

function FilaBase({ base, puede, pendiente, correr }: { base: Catalogo['bases'][number]; puede: boolean; pendiente: boolean; correr: ReturnType<typeof useAccion>['correr'] }) {
  const [precio, setPrecio] = useState(String(base.precio))
  const cambio = Number(precio.replace(',', '.')) !== base.precio
  const id = base.id
  return (
    <li className="grid grid-cols-[90px_1fr_130px_auto] items-center gap-3 px-5 py-2 text-[14px]">
      <span className="font-mono text-ink">{base.paradas} paradas</span>
      <span className="min-w-0 truncate text-[12.5px] text-ink-3">
        {base.detalle}
        {base.fuente && ` · ref. ${base.fuente}`}
      </span>
      <input aria-label="Precio" disabled={!puede} inputMode="decimal" value={precio} onChange={(e) => setPrecio(e.target.value)} className="h-9 rounded-[7px] bg-transparent px-2 text-right tabular text-ink hover:bg-subtle focus:bg-subtle focus:outline-none" />
      {puede ? (
        cambio ? (
          <Button tamano="sm" variante="primary" disabled={pendiente} onClick={() => correr(() => guardarBase(id, { tipo: base.tipo, paradas: base.paradas, precio, detalle: base.detalle ?? '', fuente: 'Actualizado a mano' }))}>
            Guardar
          </Button>
        ) : (
          <button type="button" disabled={pendiente} onClick={() => confirm(`¿Borrar el precio de ${base.paradas} paradas?`) && correr(() => eliminarBase(id), 'Precio borrado')} aria-label="Borrar" className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-bad-soft hover:text-bad">
            <Trash2 className="size-3.5" />
          </button>
        )
      ) : (
        <span />
      )}
    </li>
  )
}

function Textos({ catalogo }: { catalogo: Catalogo }) {
  const puede = usePuedeEditar()
  const { pendiente, correr } = useAccion()
  const [abierto, setAbierto] = useState<string | null>(null)
  const grupos = [
    { titulo: 'Electromecánicos', filtro: (t: Catalogo['textos'][number]) => t.grupo === 'tecnica' && t.tipos?.includes('electromecanico') },
    { titulo: 'Hidráulicos, monta vehículos y monta platos', filtro: (t: Catalogo['textos'][number]) => t.grupo === 'tecnica' && t.tipos?.includes('hidraulico') },
    { titulo: 'Condiciones generales (todos)', filtro: (t: Catalogo['textos'][number]) => t.grupo === 'condiciones' },
  ]
  return (
    <div className="flex flex-col gap-5">
      {grupos.map((g) => (
        <div key={g.titulo} className="rounded-surface border border-line bg-surface shadow-surface">
          <p className="border-b border-line px-5 py-3 font-serif text-[18px] text-ink">{g.titulo}</p>
          <ul className="divide-y divide-line">
            {catalogo.textos.filter(g.filtro).map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => setAbierto(abierto === t.id ? null : t.id)} className="flex w-full cursor-pointer items-center gap-3 px-5 py-2.5 text-left hover:bg-subtle">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-medium text-ink">
                      {t.seccion}
                      {t.porDefecto && <span className="ml-2 rounded-full bg-ok-soft px-1.5 py-px text-[10.5px] font-semibold text-ok">Por defecto</span>}
                    </span>
                    <span className="block truncate text-[12.5px] text-ink-3">{t.variante}</span>
                  </span>
                </button>
                {abierto === t.id && <EditorTexto texto={t} puede={puede} pendiente={pendiente} correr={correr} />}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function EditorTexto({ texto, puede, pendiente, correr }: { texto: Catalogo['textos'][number]; puede: boolean; pendiente: boolean; correr: ReturnType<typeof useAccion>['correr'] }) {
  const [t, setT] = useState({ variante: texto.variante, texto: texto.texto, porDefecto: texto.porDefecto })
  return (
    <div className="border-t border-line bg-subtle px-5 py-4">
      <fieldset disabled={!puede} className="flex flex-col gap-3">
        <Field label="Nombre de la versión" htmlFor={`v-${texto.id}`}>
          <Input id={`v-${texto.id}`} value={t.variante} onChange={(e) => setT({ ...t, variante: e.target.value })} />
        </Field>
        <Textarea aria-label="Texto" rows={10} value={t.texto} onChange={(e) => setT({ ...t, texto: e.target.value })} className="bg-surface text-[13.5px]" />
        <label className="flex items-center gap-2 text-[13.5px] text-ink-2">
          <input type="checkbox" checked={t.porDefecto} onChange={(e) => setT({ ...t, porDefecto: e.target.checked })} className="size-4 accent-[var(--color-brand)]" />
          Usar esta versión por defecto en las cotizaciones nuevas
        </label>
        {puede && (
          <div>
            <Button variante="primary" disabled={pendiente} onClick={() => correr(() => guardarTexto(texto.id, t))}>
              Guardar texto
            </Button>
          </div>
        )}
      </fieldset>
    </div>
  )
}

function Parametros({ catalogo }: { catalogo: Catalogo }) {
  const puede = usePuedeEditar()
  const { pendiente, correr } = useAccion()
  const c = catalogo.config
  const [v, setV] = useState({ coeficiente: c.coeficiente, redondeo: c.redondeo, iva: c.iva, validez: c.validez, pago: c.pago, plazo: c.plazo, lugar: c.lugar, moFijo: c.mano_obra.fijo, moPorParada: c.mano_obra.por_parada })
  return (
    <form
      className="rounded-surface border border-line bg-surface p-5 shadow-surface md:p-6"
      onSubmit={(e) => {
        e.preventDefault()
        correr(() => guardarParametros(v), 'Parámetros guardados')
      }}
    >
      <fieldset disabled={!puede} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Coeficiente" htmlFor="pa-coef" hint="Se multiplica el subtotal de costos. Hoy, 1,2 en casi todos.">
          <Input id="pa-coef" type="number" step="0.01" value={v.coeficiente} onChange={(e) => setV({ ...v, coeficiente: Number(e.target.value) })} />
        </Field>
        <Field label="Redondear a (US$)" htmlFor="pa-red">
          <Input id="pa-red" type="number" value={v.redondeo} onChange={(e) => setV({ ...v, redondeo: Number(e.target.value) })} />
        </Field>
        <Field label="IVA" htmlFor="pa-iva">
          <Input id="pa-iva" value={v.iva} onChange={(e) => setV({ ...v, iva: e.target.value })} />
        </Field>
        <Field label="Mano de obra: fijo (US$)" htmlFor="pa-mof" hint="Referencia = fijo + por parada × paradas. Sale de las cotizaciones de Leonardo.">
          <Input id="pa-mof" type="number" value={v.moFijo} onChange={(e) => setV({ ...v, moFijo: Number(e.target.value) })} />
        </Field>
        <Field label="Mano de obra: por parada (US$)" htmlFor="pa-mop">
          <Input id="pa-mop" type="number" value={v.moPorParada} onChange={(e) => setV({ ...v, moPorParada: Number(e.target.value) })} />
        </Field>
        <Field label="Lugar" htmlFor="pa-lugar">
          <Input id="pa-lugar" value={v.lugar} onChange={(e) => setV({ ...v, lugar: e.target.value })} />
        </Field>
        <Field label="Validez de la oferta" htmlFor="pa-val">
          <Input id="pa-val" value={v.validez} onChange={(e) => setV({ ...v, validez: e.target.value })} />
        </Field>
        <Field label="Condiciones de pago" htmlFor="pa-pago">
          <Input id="pa-pago" value={v.pago} onChange={(e) => setV({ ...v, pago: e.target.value })} />
        </Field>
        <Field label="Plazos de entrega" htmlFor="pa-plazo">
          <Input id="pa-plazo" value={v.plazo} onChange={(e) => setV({ ...v, plazo: e.target.value })} />
        </Field>
      </fieldset>
      {puede && (
        <Button type="submit" variante="primary" disabled={pendiente} className="mt-5">
          Guardar parámetros
        </Button>
      )}
    </form>
  )
}
