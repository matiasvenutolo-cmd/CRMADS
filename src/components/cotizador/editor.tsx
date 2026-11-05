'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Download, FileText, Plus, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Field, Input, Select, Textarea } from '@/components/ui/field'
import { useToast } from '@/components/ui/toast'
import { usePuedeEditar } from '@/components/shell/permisos'
import { guardarCotizacion, usarPrecioCotizado } from '@/lib/actions/cotizador'
import { CATEGORIAS, TIPOS_EQUIPO, calcular, conParadas, referenciaSugerida, uid, type Categoria, type Cotizacion, type LineaCosto, type TipoEquipo } from '@/lib/cotizador/modelo'
import { baseSugerida, manoDeObraSugerida, seccionesPorDefecto, type Catalogo } from '@/lib/cotizador/nueva'
import { cn } from '@/lib/utils'

const usd = (v: number) => `US$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v))}`
const dec = (v: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(v)

function Numero({ value, onChange, className, ...p }: { value: number; onChange: (v: number) => void; className?: string } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'>) {
  return <Input type="number" step="any" inputMode="decimal" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))} className={cn('tabular text-right', className)} {...p} />
}

function Paso({ n, titulo, descripcion, children }: { n: number; titulo: string; descripcion?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-surface border border-line bg-surface shadow-surface">
      <header className="flex items-start gap-4 border-b border-line px-5 py-4 md:px-6">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-brand font-mono text-[14px] text-white">{String(n).padStart(2, '0')}</span>
        <div>
          <h2 className="font-serif text-[22px] leading-tight text-ink">{titulo}</h2>
          {descripcion && <p className="mt-0.5 text-[13.5px] text-ink-3">{descripcion}</p>}
        </div>
      </header>
      <div className="px-5 py-5 md:px-6">{children}</div>
    </section>
  )
}

export function EditorCotizacion({
  presupuesto,
  inicial,
  guardada,
  catalogo,
}: {
  presupuesto: { id: string; etiqueta: string; direccion: string; localidad: string | null; monto: number | null; moneda: string }
  inicial: Cotizacion
  guardada: boolean
  catalogo: Catalogo
}) {
  const router = useRouter()
  const toast = useToast()
  const puedeEditar = usePuedeEditar()
  const [pendiente, start] = useTransition()
  const [c, setC] = useState<Cotizacion>(inicial)
  const [sucia, setSucia] = useState(!guardada)
  const [existe, setExiste] = useState(guardada)
  const [abiertas, setAbiertas] = useState<Record<string, boolean>>({})
  const r = useMemo(() => calcular(c), [c])

  const set = (cambio: Partial<Cotizacion>) => {
    setC((x) => ({ ...x, ...cambio }))
    setSucia(true)
  }
  const setLinea = (id: string, cambio: Partial<LineaCosto>) => set({ lineas: c.lineas.map((l) => (l.id === id ? { ...l, ...cambio } : l)) })

  const sugeridaBase = baseSugerida(catalogo, c.tipo, c.paradas)
  const moSugerida = manoDeObraSugerida(catalogo, c.paradas)
  const itemsActivos = catalogo.items.filter((i) => i.activo)

  function guardar(despues?: () => void) {
    start(async () => {
      const res = await guardarCotizacion(presupuesto.id, c)
      if (!res.ok) return toast(res.error, 'error')
      setSucia(false)
      setExiste(true)
      if (despues) despues()
      else toast('Cotización guardada')
      router.refresh()
    })
  }

  function descargar(formato: 'pdf' | 'word') {
    const abrir = () => window.open(`/cotizacion/${presupuesto.id}/${formato}${formato === 'pdf' ? '?ver' : ''}`, '_blank')
    if (sucia && puedeEditar) guardar(abrir)
    else abrir()
  }

  function usarPrecio() {
    start(async () => {
      const res = await usarPrecioCotizado(presupuesto.id, c)
      if (!res.ok) return toast(res.error, 'error')
      setSucia(false)
      setExiste(true)
      toast(`Monto del presupuesto: ${usd(r.total)}`)
      router.refresh()
    })
  }

  function cambiarTipo(tipo: TipoEquipo) {
    if (tipo === c.tipo) return
    const reemplazar = confirm('¿Cargar los textos del documento para este tipo de equipo? Se reemplazan las secciones técnicas actuales.')
    const base = baseSugerida(catalogo, tipo, c.paradas)
    set({
      tipo,
      base: base ? { precio: base.precio, descuento: catalogo.config.descuento_proveedor[tipo] ?? 1, detalle: `Lista ${base.paradas} paradas${base.detalle ? ` · ${base.detalle}` : ''}` } : c.base,
      secciones: reemplazar ? [...seccionesPorDefecto(catalogo, tipo, c.paradas).filter((s) => s.grupo === 'tecnica'), ...c.secciones.filter((s) => s.grupo === 'condiciones')] : c.secciones,
    })
  }

  function agregarDelCatalogo(id: string) {
    const it = itemsActivos.find((i) => i.id === id)
    if (!it) return
    set({ lineas: [...c.lineas, { id: uid(), categoria: it.categoria as Categoria, nombre: it.nombre, cantidad: 1, costo: it.categoria === 'mano_obra' && !it.costo ? moSugerida : it.costo, sinMargen: it.categoria === 'maquina' }] })
  }

  const variantesDe = (titulo: string, grupo: string) => catalogo.textos.filter((t) => t.seccion === titulo && t.grupo === grupo && (!t.tipos || t.tipos.includes(c.tipo)))
  const cambioMonto = presupuesto.monto == null || Math.abs(presupuesto.monto - r.total) > 0.5 || presupuesto.moneda !== 'USD'

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
      <fieldset disabled={!puedeEditar || pendiente} className="flex min-w-0 flex-col gap-6">
        {/* 01 · Equipo */}
        <Paso n={1} titulo="Equipo" descripcion="Tipo, cantidad y la ficha técnica que va en el presupuesto.">
          <div className="grid gap-3 sm:grid-cols-[1fr_110px_110px]">
            <Field label="Tipo de equipo" htmlFor="c-tipo">
              <Select id="c-tipo" value={c.tipo} onChange={(e) => cambiarTipo(e.target.value as TipoEquipo)}>
                {Object.entries(TIPOS_EQUIPO).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Equipos" htmlFor="c-cant">
              <Numero id="c-cant" value={c.cantidad} onChange={(v) => set({ cantidad: Math.max(1, Math.round(v)) })} />
            </Field>
            <Field label="Paradas" htmlFor="c-par">
              <Numero id="c-par" value={c.paradas} onChange={(v) => {
                const paradas = Math.max(1, Math.round(v))
                set({ paradas, secciones: c.secciones.map((s) => (s.grupo === 'tecnica' ? { ...s, texto: conParadas(s.texto, paradas) } : s)), ficha: c.ficha.map((f) => (/parada/i.test(f.campo) ? { ...f, valor: `${String(paradas).padStart(2, '0')} Paradas.` } : f)) })
              }} />
            </Field>
          </div>

          <p className="mb-2 mt-6 text-[12.5px] font-medium text-ink-3">Ficha técnica</p>
          <div className="divide-y divide-line rounded-control border border-line">
            {c.ficha.map((f) => (
              <div key={f.id} className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)_36px] items-center gap-2 px-2 py-1.5">
                <input aria-label="Campo" value={f.campo} onChange={(e) => set({ ficha: c.ficha.map((x) => (x.id === f.id ? { ...x, campo: e.target.value } : x)) })} className="h-9 rounded-[7px] bg-transparent px-2 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3 hover:bg-subtle focus:bg-subtle focus:outline-none" />
                <input aria-label={`Valor de ${f.campo}`} value={f.valor} onChange={(e) => set({ ficha: c.ficha.map((x) => (x.id === f.id ? { ...x, valor: e.target.value } : x)) })} className="h-9 rounded-[7px] bg-transparent px-2 text-[14px] text-ink hover:bg-subtle focus:bg-subtle focus:outline-none" />
                <button type="button" onClick={() => set({ ficha: c.ficha.filter((x) => x.id !== f.id) })} aria-label={`Quitar ${f.campo}`} className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-bad-soft hover:text-bad">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
          <Button variante="ghost" tamano="sm" className="mt-2" onClick={() => set({ ficha: [...c.ficha, { id: uid(), campo: 'Nuevo campo', valor: '' }] })}>
            <Plus className="size-3.5" /> Agregar campo
          </Button>
        </Paso>

        {/* 02 · Costos */}
        <Paso n={2} titulo="Costos" descripcion="Lo que antes estaba en el Excel: precio de lista, puertas, adicionales, fletes y mano de obra.">
          <div className="rounded-control border border-line bg-subtle p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_120px_140px]">
              <Field label="Precio base de lista (por equipo)" htmlFor="c-base" hint={c.base.detalle || undefined}>
                <Numero id="c-base" value={c.base.precio} onChange={(v) => set({ base: { ...c.base, precio: v } })} />
              </Field>
              <Field label="Descuento proveedor" htmlFor="c-desc" hint={`${dec((1 - c.base.descuento) * 100)}% off`}>
                <Numero id="c-desc" value={c.base.descuento} step="0.0001" onChange={(v) => set({ base: { ...c.base, descuento: v } })} />
              </Field>
              <Field label="Base con descuento">
                <p className="flex h-10 items-center justify-end rounded-control bg-surface px-3 font-medium tabular text-ink">{usd(r.base)}</p>
              </Field>
            </div>
            {sugeridaBase && Math.abs(sugeridaBase.precio - c.base.precio) > 0.5 && (
              <button
                type="button"
                onClick={() => set({ base: { ...c.base, precio: sugeridaBase.precio, detalle: `Lista ${sugeridaBase.paradas} paradas${sugeridaBase.detalle ? ` · ${sugeridaBase.detalle}` : ''}` } })}
                className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                <Wand2 className="size-3.5" /> Usar el precio de lista para {sugeridaBase.paradas} paradas: {usd(sugeridaBase.precio)}
              </button>
            )}
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[620px] text-[13.5px]">
              <thead>
                <tr className="text-left text-[11.5px] font-semibold uppercase tracking-wide text-ink-3">
                  <th className="pb-2 pr-2 font-semibold">Ítem</th>
                  <th className="w-20 pb-2 pr-2 text-right font-semibold">Cant.</th>
                  <th className="w-28 pb-2 pr-2 text-right font-semibold">Costo unit.</th>
                  <th className="w-28 pb-2 pr-2 text-right font-semibold">Subtotal</th>
                  <th className="w-20 pb-2 text-center font-semibold" title="Se suma después del coeficiente">Sin margen</th>
                  <th className="w-9" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {c.lineas.map((l) => (
                  <tr key={l.id} className="align-middle">
                    <td className="py-1.5 pr-2">
                      <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-ink-3">{CATEGORIAS[l.categoria]}</span>
                      <input aria-label="Ítem" value={l.nombre} onChange={(e) => setLinea(l.id, { nombre: e.target.value })} className="h-8 w-full rounded-[7px] bg-transparent px-1.5 -ml-1.5 text-ink hover:bg-subtle focus:bg-subtle focus:outline-none" />
                      {l.categoria === 'mano_obra' && Math.abs(l.costo - moSugerida) > 1 && (
                        <button type="button" onClick={() => setLinea(l.id, { costo: moSugerida })} className="cursor-pointer text-[12px] text-accent hover:underline">
                          Referencia por {c.paradas} paradas: {usd(moSugerida)}
                        </button>
                      )}
                    </td>
                    <td className="py-1.5 pr-2">
                      <Numero aria-label="Cantidad" value={l.cantidad} onChange={(v) => setLinea(l.id, { cantidad: v })} className="h-8" />
                    </td>
                    <td className="py-1.5 pr-2">
                      <Numero aria-label="Costo unitario" value={l.costo} onChange={(v) => setLinea(l.id, { costo: v })} className="h-8" />
                    </td>
                    <td className="py-1.5 pr-2 text-right font-medium tabular text-ink">{usd(l.cantidad * l.costo)}</td>
                    <td className="py-1.5 text-center">
                      <input type="checkbox" aria-label="Sin margen" checked={l.sinMargen} onChange={(e) => setLinea(l.id, { sinMargen: e.target.checked })} className="size-4 cursor-pointer accent-[var(--color-brand)]" />
                    </td>
                    <td className="py-1.5 text-right">
                      <button type="button" onClick={() => set({ lineas: c.lineas.filter((x) => x.id !== l.id) })} aria-label={`Quitar ${l.nombre}`} className="flex size-8 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-bad-soft hover:text-bad">
                        <Trash2 className="size-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="w-full sm:w-80">
              <Select aria-label="Agregar del catálogo" value="" onChange={(e) => agregarDelCatalogo(e.target.value)}>
                <option value="">+ Agregar del catálogo…</option>
                {Object.entries(CATEGORIAS).map(([k, v]) => {
                  const del = itemsActivos.filter((i) => i.categoria === k)
                  return del.length ? (
                    <optgroup key={k} label={v}>
                      {del.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nombre} {i.costo ? `· ${usd(i.costo)}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ) : null
                })}
              </Select>
            </div>
            <Button variante="ghost" onClick={() => set({ lineas: [...c.lineas, { id: uid(), categoria: 'otro', nombre: 'Ítem', cantidad: 1, costo: 0, sinMargen: false }] })}>
              <Plus className="size-4" /> Ítem libre
            </Button>
          </div>
        </Paso>

        {/* 03 · Precio */}
        <Paso n={3} titulo="Precio" descripcion="Coeficiente, redondeo y el precio final que va al cliente.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Field label="Coeficiente" htmlFor="c-coef">
              <Numero id="c-coef" step="0.01" value={c.coeficiente} onChange={(v) => set({ coeficiente: v })} />
            </Field>
            <Field label="Actualización" htmlFor="c-act">
              <Numero id="c-act" step="0.01" value={c.actualizacion} onChange={(v) => set({ actualizacion: v })} />
            </Field>
            <Field label="Descuento %" htmlFor="c-dc">
              <Numero id="c-dc" step="0.5" value={c.descuentoComercial} onChange={(v) => set({ descuentoComercial: v })} />
            </Field>
            <Field label="Redondear a" htmlFor="c-red">
              <Numero id="c-red" value={c.redondeo} onChange={(v) => set({ redondeo: v })} />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-control border border-line bg-subtle px-4 py-3">
              <p className="text-[12.5px] text-ink-3">Precio sugerido por equipo</p>
              <p className="mt-1 font-serif text-[28px] leading-none text-ink">{usd(r.sugerido)}</p>
            </div>
            <Field label="Precio final por equipo" htmlFor="c-final" hint="Vacío o 0 = se usa el sugerido.">
              <Numero id="c-final" value={c.precioManual ?? 0} onChange={(v) => set({ precioManual: v > 0 ? v : null })} />
            </Field>
          </div>

          <p className="mb-2 mt-6 text-[12.5px] font-medium text-ink-3">Precios opcionales (alternativas)</p>
          {c.alternativas.map((a) => (
            <div key={a.id} className="mb-2 grid grid-cols-[1fr_140px_36px] gap-2">
              <Input aria-label="Concepto" value={a.concepto} onChange={(e) => set({ alternativas: c.alternativas.map((x) => (x.id === a.id ? { ...x, concepto: e.target.value } : x)) })} placeholder="Con botonera táctil, con cabina panorámica…" />
              <Numero aria-label="Monto" value={a.monto} onChange={(v) => set({ alternativas: c.alternativas.map((x) => (x.id === a.id ? { ...x, monto: v } : x)) })} />
              <button type="button" onClick={() => set({ alternativas: c.alternativas.filter((x) => x.id !== a.id) })} aria-label="Quitar alternativa" className="flex size-10 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-bad-soft hover:text-bad">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          <Button variante="ghost" tamano="sm" onClick={() => set({ alternativas: [...c.alternativas, { id: uid(), concepto: '', monto: 0 }] })}>
            <Plus className="size-3.5" /> Agregar alternativa
          </Button>
        </Paso>

        {/* 04 · Documento */}
        <Paso n={4} titulo="Documento" descripcion="Encabezado, condiciones y los textos. Cada sección se puede elegir entre las versiones de siempre o editar.">
          <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
            <Field label="Atte." htmlFor="c-atte">
              <Input id="c-atte" value={c.encabezado.atencion} onChange={(e) => set({ encabezado: { ...c.encabezado, atencion: e.target.value } })} placeholder="Persona de contacto" />
            </Field>
            <Field label="Fecha" htmlFor="c-fecha">
              <Input id="c-fecha" type="date" value={c.encabezado.fecha} onChange={(e) => set({ encabezado: { ...c.encabezado, fecha: e.target.value } })} />
            </Field>
          </div>
          <Field label="Referencia" htmlFor="c-ref" className="mt-3">
            <Textarea id="c-ref" rows={2} value={c.encabezado.referencia} onChange={(e) => set({ encabezado: { ...c.encabezado, referencia: e.target.value } })} className="min-h-0" />
          </Field>
          <button type="button" onClick={() => set({ encabezado: { ...c.encabezado, referencia: referenciaSugerida({ cantidad: c.cantidad, tipo: c.tipo, direccion: presupuesto.direccion, localidad: presupuesto.localidad }) } })} className="mt-1 cursor-pointer text-[12.5px] text-accent hover:underline">
            Rearmar la referencia con los datos actuales
          </button>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Field label="Condiciones de pago" htmlFor="c-pago">
              <Input id="c-pago" value={c.condiciones.pago} onChange={(e) => set({ condiciones: { ...c.condiciones, pago: e.target.value } })} />
            </Field>
            <Field label="Plazos de entrega" htmlFor="c-plazo">
              <Input id="c-plazo" value={c.condiciones.plazo} onChange={(e) => set({ condiciones: { ...c.condiciones, plazo: e.target.value } })} />
            </Field>
            <Field label="Validez" htmlFor="c-val">
              <Input id="c-val" value={c.condiciones.validez} onChange={(e) => set({ condiciones: { ...c.condiciones, validez: e.target.value } })} />
            </Field>
          </div>

          {(['tecnica', 'condiciones'] as const).map((grupo) => (
            <div key={grupo} className="mt-6">
              <p className="mb-2 text-[12.5px] font-medium text-ink-3">{grupo === 'tecnica' ? 'Especificaciones técnicas' : 'Condiciones generales'}</p>
              <ul className="divide-y divide-line rounded-control border border-line">
                {c.secciones
                  .filter((s) => s.grupo === grupo)
                  .map((s) => {
                    const variantes = variantesDe(s.titulo, s.grupo)
                    const abierta = abiertas[s.id]
                    const actual = variantes.find((v) => v.texto === s.texto || conParadas(v.texto, c.paradas) === s.texto)
                    return (
                      <li key={s.id}>
                        <div className="flex items-center gap-3 px-3 py-2.5">
                          <input type="checkbox" aria-label={`Incluir ${s.titulo}`} checked={s.incluir} onChange={(e) => set({ secciones: c.secciones.map((x) => (x.id === s.id ? { ...x, incluir: e.target.checked } : x)) })} className="size-4 cursor-pointer accent-[var(--color-brand)]" />
                          <button type="button" onClick={() => setAbiertas({ ...abiertas, [s.id]: !abierta })} className={cn('flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 text-left', !s.incluir && 'opacity-50')}>
                            <span className="min-w-0">
                              <span className="block truncate text-[14px] font-medium text-ink">{s.titulo}</span>
                              <span className="block truncate text-[12.5px] text-ink-3">{actual ? (variantes.length > 1 ? `Versión ${variantes.indexOf(actual) + 1} de ${variantes.length}` : 'Texto estándar') : 'Texto editado'}</span>
                            </span>
                            <ChevronDown className={cn('size-4 shrink-0 text-ink-3 transition-transform', abierta && 'rotate-180')} />
                          </button>
                        </div>
                        {abierta && (
                          <div className="border-t border-line bg-subtle px-3 pb-3 pt-3">
                            {variantes.length > 1 && (
                              <Select aria-label="Versión del texto" value={actual?.id ?? ''} onChange={(e) => {
                                const v = variantes.find((x) => x.id === e.target.value)
                                if (v) set({ secciones: c.secciones.map((x) => (x.id === s.id ? { ...x, texto: x.grupo === 'tecnica' ? conParadas(v.texto, c.paradas) : v.texto } : x)) })
                              }} className="mb-2">
                                {!actual && <option value="">Texto editado</option>}
                                {variantes.map((v, i) => (
                                  <option key={v.id} value={v.id}>
                                    Versión {i + 1}: {v.variante}
                                  </option>
                                ))}
                              </Select>
                            )}
                            <Textarea aria-label={`Texto de ${s.titulo}`} rows={8} value={s.texto} onChange={(e) => set({ secciones: c.secciones.map((x) => (x.id === s.id ? { ...x, texto: e.target.value } : x)) })} className="bg-surface text-[13.5px]" />
                          </div>
                        )}
                      </li>
                    )
                  })}
              </ul>
            </div>
          ))}
        </Paso>
      </fieldset>

      {/* Resumen fijo */}
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
        <div className="banda overflow-hidden rounded-surface text-white shadow-surface">
          <div className="px-5 pb-5 pt-5">
            <p className="kicker kicker-claro">Precio por equipo</p>
            <p className="mt-2 font-serif text-[44px] leading-none">{usd(r.unitario)}</p>
            <p className="mt-1.5 text-[13px] text-white/70">+ impuestos · {c.precioManual ? 'precio final manual' : `sugerido (coef. ${dec(c.coeficiente)})`}</p>
            {r.cantidad > 1 && (
              <p className="mt-3 border-t border-white/15 pt-3 text-[14px]">
                Total {r.cantidad} equipos: <span className="font-semibold">{usd(r.total)}</span>
              </p>
            )}
          </div>
          <dl className="grid grid-cols-2 border-t border-white/15 text-[13px]">
            <div className="border-r border-white/15 px-5 py-3">
              <dt className="text-white/60">Costo</dt>
              <dd className="mt-0.5 font-semibold tabular">{usd(r.costo)}</dd>
            </div>
            <div className="px-5 py-3">
              <dt className="text-white/60">Margen</dt>
              <dd className={cn('mt-0.5 font-semibold tabular', r.margen < 0 ? 'text-naranja' : '')}>
                {usd(r.margen)} · {Math.round(r.margenPct * 100)}%
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-surface border border-line bg-surface p-4 shadow-surface">
          <p className="mb-2 text-[12.5px] font-medium text-ink-3">Desglose por equipo</p>
          <dl className="flex flex-col gap-1.5 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink-2">Base de lista con descuento</dt>
              <dd className="tabular text-ink">{usd(r.base)}</dd>
            </div>
            {(Object.keys(CATEGORIAS) as Categoria[])
              .filter((k) => r.porCategoria[k])
              .map((k) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-ink-2">{CATEGORIAS[k]}</dt>
                  <dd className="tabular text-ink">{usd(r.porCategoria[k])}</dd>
                </div>
              ))}
            <div className="mt-1 flex justify-between border-t border-line pt-2 font-medium">
              <dt>Subtotal × {dec(c.coeficiente * c.actualizacion)}</dt>
              <dd className="tabular">{usd(r.conCoeficiente)}</dd>
            </div>
            {r.sinMargen > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-2">+ sin margen</dt>
                <dd className="tabular text-ink">{usd(r.sinMargen)}</dd>
              </div>
            )}
          </dl>
        </div>

        {puedeEditar && (
          <div className="flex flex-col gap-2">
            <Button variante="primary" onClick={() => guardar()} cargando={pendiente} className="justify-center">
              {sucia ? 'Guardar cotización' : 'Guardada'}
            </Button>
            {cambioMonto && (
              <Button variante="accent" onClick={usarPrecio} disabled={pendiente} className="justify-center">
                <Sparkles className="size-4" /> Usar {usd(r.total)} en el presupuesto
              </Button>
            )}
            {!cambioMonto && <p className="text-center text-[12.5px] text-ok">El presupuesto ya tiene este monto.</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button variante="secondary" onClick={() => descargar('word')} disabled={!existe && !puedeEditar} className="justify-center">
            <FileText className="size-4" /> Word
          </Button>
          <Button variante="secondary" onClick={() => descargar('pdf')} disabled={!existe && !puedeEditar} className="justify-center">
            <Download className="size-4" /> PDF
          </Button>
        </div>
        <p className="text-center text-[12px] text-ink-3">{presupuesto.etiqueta} · el documento sale con estos datos.</p>
      </aside>
    </div>
  )
}
