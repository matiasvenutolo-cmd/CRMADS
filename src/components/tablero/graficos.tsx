import { ESTADOS_PRESUPUESTO, type EstadoPresupuesto } from '@/lib/dominio'
import { dineroCompacto } from '@/lib/formato'
import { cn } from '@/lib/utils'
import type { DatosTablero } from '@/lib/data/tablero'

export const usd = (n: number) => dineroCompacto(Math.round(n), 'USD')
export const pct = (n: number | null) => (n == null ? '—' : `${Math.round(n * 100)}%`)
export const miles = (n: number) => `US$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n / 100) / 10)} mil`

/** Tarjeta del tablero: antetítulo, una lectura en palabras y el gráfico. */
export function Tarjeta({ kicker, titulo, lectura, children, className }: { kicker: string; titulo?: React.ReactNode; lectura?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('flex min-w-0 flex-col rounded-surface border border-line bg-surface p-5 shadow-surface md:p-6', className)}>
      <p className="kicker">{kicker}</p>
      {titulo && <h2 className="mt-2 font-serif text-[24px] leading-[1.05] text-ink md:text-[27px]">{titulo}</h2>}
      {lectura && <p className="mt-1.5 text-[14px] leading-snug text-ink-3">{lectura}</p>}
      <div className="mt-5 flex-1">{children}</div>
    </section>
  )
}

/** Fila con barra horizontal proporcional. */
export function FilaBarra({ label, valor, detalle, proporcion, color = 'var(--color-accent)', href }: { label: React.ReactNode; valor: React.ReactNode; detalle?: React.ReactNode; proporcion: number; color?: string; href?: string }) {
  const Tag = href ? 'a' : 'div'
  return (
    <Tag href={href} className={cn('block', href && 'group')}>
      <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
        <span className={cn('min-w-0 truncate text-ink-2', href && 'group-hover:text-ink group-hover:underline')}>{label}</span>
        <span className="shrink-0 tabular font-medium text-ink">
          {valor}
          {detalle && <span className="ml-1.5 font-normal text-ink-3">{detalle}</span>}
        </span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-ink/[0.06]">
        <div className="h-full rounded-full" style={{ width: `${Math.max(proporcion > 0 ? 2 : 0, Math.min(1, proporcion) * 100)}%`, background: color }} />
      </div>
    </Tag>
  )
}

/** Barra apilada del embudo: cuánta plata hay en cada estado. */
export function Embudo({ embudo }: { embudo: DatosTablero['embudo'] }) {
  const total = embudo.reduce((t, e) => t + e.monto, 0) || 1
  return (
    <div>
      <div className="flex h-10 overflow-hidden rounded-[8px] bg-ink/[0.05]">
        {embudo
          .filter((e) => e.monto > 0)
          .map((e) => (
            <div key={e.estado} title={`${ESTADOS_PRESUPUESTO[e.estado].label}: ${usd(e.monto)}`} className="h-full border-r-2 border-surface last:border-r-0" style={{ width: `${(e.monto / total) * 100}%`, background: ESTADOS_PRESUPUESTO[e.estado].color }} />
          ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3.5 sm:grid-cols-5">
        {embudo.map((e) => (
          <div key={e.estado} className="min-w-0">
            <dt className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
              <span className="size-2 shrink-0 rounded-full" style={{ background: ESTADOS_PRESUPUESTO[e.estado].color }} />
              {ESTADOS_PRESUPUESTO[e.estado].label}
            </dt>
            <dd className="mt-0.5 font-serif text-[22px] leading-none text-ink">{usd(e.monto)}</dd>
            <dd className="mt-1 text-[12.5px] text-ink-3 tabular">
              {e.n} presup. · {e.equipos} eq.
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const COLOR_PUNTO: Record<EstadoPresupuesto, string> = {
  ganado: 'var(--color-ok)',
  perdido: 'var(--color-bad)',
  borrador: 'var(--color-ink-3)',
  enviado: 'var(--color-accent)',
  negociacion: 'var(--color-teal)',
}

/** Dispersión: precio por equipo contra cantidad de paradas, con la mediana como línea. */
export function PrecioPorParadas({ precios }: { precios: DatosTablero['precios'] }) {
  const { puntos, porParadas } = precios
  if (puntos.length < 3) return <p className="text-[14px] text-ink-3">Hacen falta más presupuestos de electromecánicos con paradas cargadas.</p>

  const W = 640
  const H = 290
  const m = { t: 12, r: 14, b: 34, l: 52 }
  const xMin = Math.min(...puntos.map((p) => p.paradas))
  const xMax = Math.max(...puntos.map((p) => p.paradas))
  const paso = 20_000
  const yMax = Math.ceil((Math.max(...puntos.map((p) => p.porEquipo)) * 1.05) / paso) * paso
  const x = (v: number) => m.l + ((v - xMin) / Math.max(1, xMax - xMin)) * (W - m.l - m.r)
  const y = (v: number) => H - m.b - (v / yMax) * (H - m.t - m.b)
  const lineasY = Array.from({ length: yMax / paso + 1 }, (_, i) => i * paso)
  const ticksX = [...new Set([xMin, ...porParadas.map((g) => g.paradas).filter((p) => p % 2 === 0), xMax])]

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Precio por equipo según cantidad de paradas">
        {lineasY.map((v) => (
          <g key={v}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--color-line)" strokeDasharray={v ? '3 4' : undefined} />
            <text x={m.l - 8} y={y(v) + 4} textAnchor="end" className="fill-ink-3 font-mono text-[11px]">
              {v ? `${v / 1000}k` : '0'}
            </text>
          </g>
        ))}
        {ticksX.map((v) => (
          <text key={v} x={x(v)} y={H - m.b + 18} textAnchor="middle" className="fill-ink-3 font-mono text-[11px]">
            {v}
          </text>
        ))}
        <text x={W - m.r} y={H - 2} textAnchor="end" className="fill-ink-3 text-[11px]">
          paradas
        </text>
        <polyline points={porParadas.map((g) => `${x(g.paradas)},${y(g.mediana)}`).join(' ')} fill="none" stroke="var(--color-naranja)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {puntos.map((p) => (
          <circle key={p.id} cx={x(p.paradas)} cy={y(p.porEquipo)} r={5} fill={COLOR_PUNTO[p.estado]} fillOpacity={p.estado === 'ganado' || p.estado === 'perdido' ? 0.9 : 0.35} stroke="var(--color-surface)" strokeWidth="1.5">
            <title>{`${p.cliente} · ${p.paradas} paradas · ${miles(p.porEquipo)} por equipo · ${ESTADOS_PRESUPUESTO[p.estado].label}`}</title>
          </circle>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-ink-3">
        <Leyenda color="var(--color-naranja)" linea>
          Mediana
        </Leyenda>
        <Leyenda color="var(--color-ok)">Ganado</Leyenda>
        <Leyenda color="var(--color-bad)">Perdido</Leyenda>
        <Leyenda color="var(--color-accent)" tenue>
          En juego
        </Leyenda>
      </div>
    </div>
  )
}

function Leyenda({ color, children, linea, tenue }: { color: string; children: React.ReactNode; linea?: boolean; tenue?: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={linea ? 'h-[3px] w-4 rounded-full' : 'size-2.5 rounded-full'} style={{ background: color, opacity: tenue ? 0.45 : 1 }} />
      {children}
    </span>
  )
}

/** Columnas mensuales simples (ritmo comercial). */
export function Columnas({ datos }: { datos: { label: string; valor: number; detalle: string }[] }) {
  const max = Math.max(1, ...datos.map((d) => d.valor))
  return (
    <div className="flex h-44 items-end gap-2">
      {datos.map((d) => (
        <div key={d.label} className="flex min-w-0 flex-1 flex-col items-center gap-1.5" title={d.detalle}>
          <span className="font-mono text-[11.5px] text-ink-2">{d.valor || ''}</span>
          <div className="w-full max-w-10 rounded-t-[5px] bg-accent" style={{ height: `${(d.valor / max) * 120}px`, minHeight: d.valor ? 3 : 0 }} />
          <span className="font-mono text-[11px] uppercase text-ink-3">{d.label}</span>
        </div>
      ))}
    </div>
  )
}
