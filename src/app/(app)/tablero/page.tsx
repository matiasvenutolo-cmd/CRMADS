import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { datosTablero } from '@/lib/data/tablero'
import { getUsuarioActual } from '@/lib/session'
import { fechaLarga } from '@/lib/fechas'
import { Columnas, Embudo, FilaBarra, PrecioPorParadas, Tarjeta, miles, pct, usd } from '@/components/tablero/graficos'

export const metadata: Metadata = { title: 'Tablero' }

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function saludo() {
  const hora = Number(new Intl.DateTimeFormat('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: 'numeric', hour12: false }).format(new Date()))
  return hora < 13 ? 'Buen día' : hora < 20 ? 'Buenas tardes' : 'Buenas noches'
}

function signo(v: number) {
  const n = Math.round(v * 100)
  return n === 0 ? 'en la mediana' : `${Math.abs(n)}% ${n > 0 ? 'por encima' : 'por debajo'} de la mediana`
}

export default async function TableroPage() {
  const usuario = await getUsuarioActual()
  if (usuario.rol !== 'direccion') redirect('/')
  const d = await datosTablero()
  const { resumen: r, cierre, salud, precios, obras, clientes } = d
  const nombre = usuario.nombre.split(' ')[0]

  if (!d.hayDatos) {
    return (
      <header>
        <p className="kicker">{fechaLarga(d.hoy)}</p>
        <h1 className="mt-1.5 font-serif text-[40px] font-extrabold leading-[1] text-ink md:text-[56px]">
          {saludo()}, {nombre}.
        </h1>
        <p className="mt-2 max-w-xl text-[15.5px] text-ink-2">Todavía no hay presupuestos cargados. El tablero se arma solo a medida que se usa el sistema.</p>
      </header>
    )
  }

  const motivoPrincipal = d.motivos[0]
  const maxTipo = Math.max(1, ...d.tipologias.map((t) => t.monto))
  const maxCliente = Math.max(1, ...clientes.top.map((c) => c.ganado + c.enJuego + c.perdido))
  const zonas = d.zonas.slice(0, 7)
  const maxZona = Math.max(1, ...zonas.map((z) => z.monto))
  const maxEtapa = Math.max(1, ...obras.porEtapa.map((e) => e.n))
  const maxTramo = Math.max(1, ...salud.tramos.map((t) => t.n))
  const sinPaso = salud.enviados ? salud.sinProximoPaso / salud.enviados : 0

  return (
    <div>
      <header className="mb-7 md:mb-9">
        <p className="kicker">{fechaLarga(d.hoy)}</p>
        <h1 className="mt-1.5 font-serif text-[40px] font-extrabold leading-[1] tracking-[-0.01em] text-ink md:text-[56px]">
          {saludo()}, {nombre}.
        </h1>
        <p className="mt-2 max-w-2xl text-[15.5px] text-ink-2">
          Hay <b className="font-semibold text-ink">{usd(r.cartera.monto)}</b> en juego en {r.cartera.n} presupuestos
          {cierre.porCantidad != null && (
            <>
              {' '}
              y se cierran <b className="font-semibold text-ink">{pct(cierre.porCantidad)}</b> de los que ya se definieron
            </>
          )}
          .{obras.enCurso > 0 && ` ${obras.enCurso} obras en curso con ${obras.equipos} equipos.`}
        </p>
      </header>

      {/* Lo esencial, de un vistazo */}
      <section className="banda overflow-hidden rounded-surface text-white shadow-surface">
        <dl className="grid grid-cols-2 divide-white/12 lg:grid-cols-4 lg:divide-x">
          <Kpi label="En juego" valor={usd(r.cartera.monto)} detalle={`${r.cartera.n} presupuestos · ${r.cartera.equipos} equipos`} />
          <Kpi label="Ganado" valor={usd(r.ganado.monto)} detalle={`${r.ganado.n} presupuestos · ${r.ganado.equipos} equipos`} />
          <Kpi label="Tasa de cierre" valor={pct(cierre.porCantidad)} detalle={cierre.decididos ? `${r.ganado.n} de ${cierre.decididos} definidos · ${pct(cierre.porMonto)} del monto` : 'Sin presupuestos definidos'} />
          <Kpi
            label="Proyección"
            valor={r.proyeccion != null ? usd(r.proyeccion) : '—'}
            detalle={r.proyeccion != null ? 'Estimado, si la cartera cierra a la tasa actual' : 'Con 5 definidos se calcula'}
            acento
          />
        </dl>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <Tarjeta kicker="Embudo comercial" titulo={`${usd(r.cotizado.monto)} cotizados`} lectura={`${r.cotizado.n} presupuestos por ${r.cotizado.equipos} equipos. Cada color es la plata que hay en cada estado.`}>
          <Embudo embudo={d.embudo} />
        </Tarjeta>

        <Tarjeta
          kicker="Salud de la cartera"
          titulo={salud.sinProximoPaso ? `${salud.sinProximoPaso} sin próximo paso` : 'Todo con próximo paso'}
          lectura={
            salud.sinProximoPaso
              ? `El ${pct(sinPaso)} de los enviados no tiene fecha de seguimiento.${salud.vencidos ? ` ${salud.vencidos} con seguimiento vencido.` : ''}`
              : salud.vencidos
                ? `${salud.vencidos} con el seguimiento vencido.`
                : 'Cada presupuesto enviado tiene su seguimiento agendado.'
          }
        >
          <div className="flex flex-col gap-3.5">
            <p className="text-[12.5px] text-ink-3">Antigüedad desde el envío</p>
            {salud.tramos.map((t, i) => (
              <FilaBarra key={t.label} label={t.label} valor={t.n} detalle={t.n ? usd(t.monto) : undefined} proporcion={t.n / maxTramo} color={i < 2 ? 'var(--color-accent)' : 'var(--color-naranja)'} />
            ))}
          </div>
        </Tarjeta>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
        <Tarjeta
          kicker="Precio por equipo · electromecánicos"
          titulo="Cuánto vale cada parada"
          lectura={
            precios.desvioPerdidos != null && precios.desvioGanados != null
              ? `Los ganados quedaron ${signo(precios.desvioGanados)}; los perdidos, ${signo(precios.desvioPerdidos)} para su cantidad de paradas.`
              : `${precios.puntos.length} presupuestos. Cada punto es uno; la línea naranja es el precio típico.`
          }
        >
          <PrecioPorParadas precios={precios} />
        </Tarjeta>

        <Tarjeta kicker="Referencia de precios" titulo={r.ticketEquipo ? `${miles(r.ticketEquipo)} por equipo ganado` : 'Precio típico por equipo'} lectura="Promedio de lo ganado; abajo, la mediana cotizada por equipo electromecánico según la altura.">
          <ul className="divide-y divide-line">
            {precios.rangos.map((g) => (
              <li key={g.label} className="flex items-baseline justify-between gap-3 py-3 first:pt-0">
                <span className="text-[14px] text-ink-2">
                  {g.label}
                  <span className="ml-1.5 text-[12.5px] text-ink-3">{g.n} presup.</span>
                </span>
                <span className="font-serif text-[22px] leading-none text-ink">{miles(g.mediana)}</span>
              </li>
            ))}
          </ul>
        </Tarjeta>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2 lg:gap-6">
        <Tarjeta
          kicker="Clientes"
          titulo={`${clientes.total} clientes cotizados`}
          lectura={
            clientes.concentracion != null && clientes.top3Cartera.length
              ? `Los 3 principales concentran el ${pct(clientes.concentracion)} de lo que está en juego (${clientes.top3Cartera.map((c) => c.nombre.split(' - ')[0]).join(', ')}).`
              : undefined
          }
        >
          <ul className="flex flex-col gap-3.5">
            {clientes.top.map((c) => {
              const total = c.ganado + c.enJuego + c.perdido
              return (
                <li key={c.id}>
                  <a href={`/clientes/${c.id}`} className="group block">
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="min-w-0 truncate text-ink-2 group-hover:text-ink group-hover:underline">{c.nombre}</span>
                      <span className="shrink-0 tabular font-medium text-ink">
                        {usd(total)}
                        <span className="ml-1.5 font-normal text-ink-3">
                          {c.ganados ? `${c.ganados} ganado${c.ganados > 1 ? 's' : ''}` : ''}
                          {c.ganados && c.perdidos ? ' · ' : ''}
                          {c.perdidos ? `${c.perdidos} perdido${c.perdidos > 1 ? 's' : ''}` : ''}
                          {!c.ganados && !c.perdidos ? `${c.n} en juego` : ''}
                        </span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex h-2 overflow-hidden rounded-full bg-ink/[0.06]" style={{ width: `${Math.max(4, (total / maxCliente) * 100)}%` }}>
                      <span className="h-full bg-ok" style={{ width: `${(c.ganado / total) * 100}%` }} />
                      <span className="h-full bg-accent/45" style={{ width: `${(c.enJuego / total) * 100}%` }} />
                      <span className="h-full bg-bad" style={{ width: `${(c.perdido / total) * 100}%` }} />
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </Tarjeta>

        <div className="flex min-w-0 flex-col gap-5 lg:gap-6">
          <Tarjeta
            kicker="Por qué se pierde"
            titulo={motivoPrincipal ? `${motivoPrincipal.motivo}: ${motivoPrincipal.n} de ${r.perdido.n}` : 'Sin presupuestos perdidos'}
            lectura={r.perdido.n ? `Se perdieron ${usd(r.perdido.monto)} en ${r.perdido.n} presupuestos.` : 'Cuando se marque uno como perdido, acá se ve el motivo.'}
          >
            <div className="flex flex-col gap-3.5">
              {d.motivos.map((m) => (
                <FilaBarra key={m.motivo} label={m.motivo} valor={m.n} detalle={usd(m.monto)} proporcion={m.n / Math.max(1, r.perdido.n)} color="var(--color-bad)" />
              ))}
            </div>
          </Tarjeta>

          <Tarjeta kicker="Por tipología" titulo={d.tipologias[0]?.tipologia} lectura={d.tipologias[0] && `Es el ${pct(d.tipologias[0].monto / Math.max(1, r.cotizado.monto))} de lo cotizado.`}>
            <div className="flex flex-col gap-3.5">
              {d.tipologias.map((t) => (
                <FilaBarra key={t.tipologia} label={t.tipologia} valor={usd(t.monto)} detalle={`${t.equipos} eq.${t.cierre != null ? ` · cierre ${pct(t.cierre)}` : ''}`} proporcion={t.monto / maxTipo} />
              ))}
            </div>
          </Tarjeta>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-6">
        <Tarjeta
          kicker="Obras"
          titulo={`${obras.enCurso} en curso · ${obras.equipos} equipos`}
          lectura={
            [obras.atrasadas && `${obras.atrasadas} con la etapa atrasada`, obras.fueraDePlazo && `${obras.fueraDePlazo} pasadas de la fecha de entrega`, obras.terminadas && `${obras.terminadas} terminadas`].filter(Boolean).join(' · ') ||
            'Ninguna obra atrasada.'
          }
        >
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <div>
              <p className="mb-3 text-[12.5px] text-ink-3">En qué etapa están</p>
              <ol className="flex flex-col gap-2">
                {obras.porEtapa.map((e) => (
                  <li key={e.orden} className="flex items-center gap-2.5 text-[13px]">
                    <span className="w-5 shrink-0 font-mono text-[12px] text-ink-3">{String(e.orden).padStart(2, '0')}</span>
                    <span className={e.n ? 'min-w-0 flex-1 truncate text-ink' : 'min-w-0 flex-1 truncate text-ink-3'}>{e.nombre}</span>
                    <span className="flex h-2 w-16 shrink-0 overflow-hidden rounded-full bg-ink/[0.06]">
                      <span className="h-full rounded-full bg-naranja" style={{ width: `${(e.n / maxEtapa) * 100}%` }} />
                    </span>
                    <span className="w-5 shrink-0 text-right font-mono text-[12.5px] text-ink">{e.n || ''}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div>
              <p className="mb-3 text-[12.5px] text-ink-3">Entregas previstas</p>
              {obras.entregas.length ? (
                <Columnas datos={obras.entregas.map((e) => ({ label: `${e.trimestre.slice(5)} ${e.trimestre.slice(2, 4)}`, valor: e.equipos, detalle: `${e.n} obras · ${e.equipos} equipos` }))} />
              ) : (
                <p className="text-[13.5px] text-ink-3">Sin fechas de entrega cargadas.</p>
              )}
              <p className="mt-2 text-[12px] text-ink-3">Equipos por trimestre{obras.sinFechaFin ? ` · ${obras.sinFechaFin} obras sin fecha` : ''}</p>
            </div>
          </div>
        </Tarjeta>

        <Tarjeta kicker="Zonas" titulo={zonas[0]?.localidad} lectura={zonas[0] && `${zonas[0].n} presupuestos, ${usd(zonas[0].monto)} cotizados.`}>
          <div className="flex flex-col gap-3.5">
            {zonas.map((z) => (
              <FilaBarra key={z.localidad} label={z.localidad} valor={usd(z.monto)} detalle={`${z.n} presup.`} proporcion={z.monto / maxZona} color="var(--color-teal)" />
            ))}
          </div>
        </Tarjeta>
      </div>

      <div className="mt-5">
        <Tarjeta kicker="Ritmo comercial" titulo={d.mesesConEnvios >= 2 ? 'Presupuestos enviados por mes' : 'Evolución mensual'} lectura={d.mesesConEnvios < 2 ? 'La evolución mes a mes se completa a medida que se cargan presupuestos nuevos con su fecha de envío.' : 'Cantidad de presupuestos enviados en cada mes.'}>
          {d.mesesConEnvios >= 2 && (
            <Columnas
              datos={d.ritmo.map((m) => ({ label: `${MESES[Number(m.mes.slice(5)) - 1]} ${m.mes.slice(2, 4)}`, valor: m.enviados, detalle: `${m.enviados} enviados · ${usd(m.montoEnviado)}` }))}
            />
          )}
        </Tarjeta>
      </div>

      {d.enPesos.n > 0 && <p className="mt-4 text-[12.5px] text-ink-3">Los montos son en dólares. Hay además {d.enPesos.n} presupuestos en pesos que no se suman.</p>}
    </div>
  )
}

function Kpi({ label, valor, detalle, acento }: { label: string; valor: string; detalle: string; acento?: boolean }) {
  return (
    <div className="border-white/12 px-5 py-5 [&:nth-child(-n+2)]:border-b lg:px-6 lg:py-6 lg:[&:nth-child(-n+2)]:border-b-0">
      <dt className="kicker kicker-claro">{label}</dt>
      <dd className={`mt-2 font-serif text-[34px] leading-none md:text-[44px] ${acento ? 'text-naranja' : 'text-white'}`}>{valor}</dd>
      <dd className="mt-2 text-[12.5px] leading-snug text-white/70">{detalle}</dd>
    </div>
  )
}
