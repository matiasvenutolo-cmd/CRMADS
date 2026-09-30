export function BarraSimple({ datos, colorClase = 'bg-brand-blue' }: { datos: { label: string; cantidad: number }[]; colorClase?: string }) {
  const max = Math.max(1, ...datos.map((d) => d.cantidad))
  return (
    <div className="space-y-2.5">
      {datos.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <span className="w-36 shrink-0 truncate text-xs text-muted">{d.label}</span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
            <div className={`h-full rounded-full ${colorClase}`} style={{ width: `${(d.cantidad / max) * 100}%` }} />
          </div>
          <span className="w-5 shrink-0 text-right text-xs font-medium text-ink">{d.cantidad}</span>
        </div>
      ))}
    </div>
  )
}
