import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, CircleCheck } from 'lucide-react'
import { datosHoy, hayDatos } from '@/lib/data/hoy'
import { getUsuarioActual } from '@/lib/session'
import { fechaCorta, fechaLarga, relativo } from '@/lib/fechas'
import { codigoObra, codigoPresupuesto } from '@/lib/dominio'
import { dinero, dineroCompacto } from '@/lib/formato'
import { Surface, SurfaceHeader } from '@/components/ui/surface'
import { Aviso } from '@/components/ui/estado'
import { Codigo } from '@/components/comun/page-head'
import { AccionesSeguimiento } from '@/components/hoy/acciones-seguimiento'
import { PrimerosPasos } from '@/components/hoy/primeros-pasos'
import { EtapasAValidar } from '@/components/hoy/etapas-a-validar'

export const metadata: Metadata = { title: 'Hoy' }

function saludo() {
  const hora = Number(new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: 'numeric', hour12: false }).format(new Date()))
  return hora < 13 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'
}

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`
}

export default async function HoyPage() {
  const [usuario, d, conDatos] = await Promise.all([getUsuarioActual(), datosHoy(), hayDatos()])
  const nombre = usuario.nombre.split(' ')[0]

  const pendientes = d.seguimientos.length + d.etapasAtrasadas.length
  const resumen = !conDatos
    ? 'Este es tu tablero diario: acá vas a ver qué seguimientos tocan y qué obras necesitan atención.'
    : pendientes === 0
      ? 'No hay nada vencido. Buen momento para adelantar algo.'
      : [d.seguimientos.length && plural(d.seguimientos.length, 'seguimiento para hacer', 'seguimientos para hacer'), d.etapasAtrasadas.length && plural(d.etapasAtrasadas.length, 'obra atrasada', 'obras atrasadas')]
          .filter(Boolean)
          .join(' y ')
          .replace(/^./, (c) => `Tenés ${c.toLowerCase()}`) + '.'

  return (
    <div>
      <header className="mb-8 md:mb-10">
        <p className="kicker">{fechaLarga(d.hoy)}</p>
        <h1 className="mt-1.5 font-serif text-[40px] font-extrabold leading-[1] tracking-[-0.01em] text-ink md:text-[56px]">
          {saludo()}, {nombre}.
        </h1>
        <p className="mt-2 max-w-xl text-[15.5px] text-ink-2">{resumen}</p>
      </header>

      {!conDatos ? (
        <div className="flex flex-col gap-6">
          <PrimerosPasos />
          <EtapasAValidar />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7">
          <div className="flex min-w-0 flex-col gap-5">
            <Surface>
              <SurfaceHeader titulo={`Seguimientos para hoy${d.seguimientos.length ? ` · ${d.seguimientos.length}` : ''}`} />
              {d.seguimientos.length === 0 ? (
                <div className="flex items-center gap-2.5 px-5 py-5 text-[14px] text-ink-3">
                  <CircleCheck className="size-[18px] text-ok" />
                  No hay llamadas pendientes. Al día.
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {d.seguimientos.map((p) => {
                    const vencido = p.proximoSeguimiento! < d.hoy
                    return (
                      <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
                        <Link href={`/presupuestos/${p.id}`} className="group min-w-0 flex-1">
                          <p className="truncate text-[15px] font-medium text-ink group-hover:underline">{p.clienteNombre}</p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
                            <span className="truncate">{p.direccion}</span>
                            <Codigo>{codigoPresupuesto(p.numero)}</Codigo>
                            {p.monto != null && <span className="tabular">{dinero(p.monto, p.moneda)}</span>}
                          </p>
                          <p className="mt-1.5">{vencido ? <Aviso>Vencido {relativo(p.proximoSeguimiento!)}</Aviso> : <Aviso tono="accent">Para hoy</Aviso>}</p>
                        </Link>
                        <AccionesSeguimiento presupuestoId={p.id} titulo={`${p.clienteNombre} · ${p.direccion}`} hoy={d.hoy} />
                      </li>
                    )
                  })}
                </ul>
              )}
            </Surface>

            {d.sinProximoPaso.length > 0 && (
              <Surface>
                <SurfaceHeader titulo={`Enviados sin próximo paso · ${d.sinProximoPaso.length}`} />
                <p className="px-5 pt-3 text-[13px] text-ink-3">Presupuestos enviados que no tienen fecha para volver a llamar.</p>
                <ul className="divide-y divide-line">
                  {d.sinProximoPaso.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center">
                      <Link href={`/presupuestos/${p.id}`} className="group min-w-0 flex-1">
                        <p className="truncate text-[14.5px] font-medium text-ink group-hover:underline">{p.clienteNombre}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-[13px] text-ink-3">
                          <span className="truncate">{p.direccion}</span>
                          {p.fechaEnvio && <span className="shrink-0">· enviado {relativo(p.fechaEnvio)}</span>}
                        </p>
                      </Link>
                      <AccionesSeguimiento presupuestoId={p.id} titulo={`${p.clienteNombre} · ${p.direccion}`} hoy={d.hoy} conPosponer={false} />
                    </li>
                  ))}
                </ul>
                {d.sinProximoPaso.length > 5 && (
                  <Link href="/presupuestos?filtro=activos" className="flex items-center justify-center gap-1 border-t border-line px-5 py-3 text-[13px] font-medium text-accent hover:bg-subtle">
                    Ver los {d.sinProximoPaso.length} en Presupuestos <ArrowUpRight className="size-3.5" />
                  </Link>
                )}
              </Surface>
            )}

            <Surface>
              <SurfaceHeader titulo="En obra" accion={<Link href="/obras" className="text-[13px] font-medium text-ink-3 hover:text-ink">Ver obras</Link>} />
              {d.etapasAtrasadas.length === 0 && d.etapasSemana.length === 0 ? (
                <p className="px-5 py-5 text-[14px] text-ink-3">Ninguna etapa vencida ni prevista para esta semana.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {[...d.etapasAtrasadas.map((e) => ({ ...e, atrasada: true })), ...d.etapasSemana.map((e) => ({ ...e, atrasada: false }))].map((e) => (
                    <li key={e.etapaId}>
                      <Link href={`/obras/${e.obraId}`} className="group flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-subtle">
                        <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-[10px] border border-line bg-subtle font-serif text-[20px] leading-none text-ink">
                          {e.orden}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14.5px] font-medium text-ink">{e.etapa}</span>
                          <span className="block truncate text-[13px] text-ink-3">
                            {e.direccion} · {e.clienteNombre} · <span className="font-mono text-[12px]">{codigoObra(e.numero)}</span>
                          </span>
                        </span>
                        {e.atrasada ? <Aviso>Atrasada desde el {fechaCorta(e.fechaPrevista)}</Aviso> : <span className="shrink-0 text-[13px] text-ink-2">{relativo(e.fechaPrevista!)}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Surface>
          </div>

          <aside className="flex flex-col gap-5">
            <Surface className="p-5">
              <p className="text-[13px] font-medium text-ink-3">Presupuestos en juego</p>
              <p className="mt-1 font-serif text-[56px] leading-none tracking-[-0.02em] text-ink">{d.enJuego.cantidad}</p>
              {d.enJuego.porMoneda.length > 0 && (
                <div className="mt-3 flex flex-col gap-0.5">
                  {d.enJuego.porMoneda.map((m) => (
                    <p key={m.moneda} className="tabular text-[14px] text-ink-2">
                      {dineroCompacto(m.total, m.moneda)} <span className="text-ink-3">cotizados</span>
                    </p>
                  ))}
                </div>
              )}
              <Link href="/presupuestos" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
                Ver presupuestos <ArrowUpRight className="size-3.5" />
              </Link>
            </Surface>
            <Surface className="p-5">
              <p className="text-[13px] font-medium text-ink-3">Obras en curso</p>
              <p className="mt-1 font-serif text-[56px] leading-none tracking-[-0.02em] text-ink">{d.obrasEnCurso}</p>
              {d.etapasAtrasadas.length > 0 && <p className="mt-3 text-[14px] text-warn">{plural(d.etapasAtrasadas.length, 'con atraso', 'con atraso')}</p>}
              <Link href="/obras" className="mt-4 inline-flex items-center gap-1 text-[13px] font-medium text-accent hover:underline">
                Ver obras <ArrowUpRight className="size-3.5" />
              </Link>
            </Surface>
          </aside>
          <div className="lg:col-span-2">
            <EtapasAValidar />
          </div>
        </div>
      )}
    </div>
  )
}
