/**
 * Elemento de marca del sistema: el hueco del ascensor con una parada por
 * etapa de obra, y la cabina detenida en la etapa actual.
 */
export function HuecoIlustracion({ paradas = 9, actual = 4, className }: { paradas?: number; actual?: number; className?: string }) {
  const alto = 520
  const paso = alto / (paradas + 1)
  return (
    <svg viewBox={`0 0 220 ${alto}`} className={className} fill="none" aria-hidden>
      <rect x="70" y="0" width="80" height={alto} stroke="currentColor" strokeOpacity="0.16" />
      <line x1="110" y1="0" x2="110" y2={alto} stroke="currentColor" strokeOpacity="0.1" strokeDasharray="2 6" />
      {Array.from({ length: paradas }, (_, i) => {
        const n = paradas - i
        const y = paso * (i + 1)
        const hecha = n < actual
        const esActual = n === actual
        return (
          <g key={n}>
            <line x1="30" y1={y} x2="70" y2={y} stroke="currentColor" strokeOpacity={esActual ? 0.9 : 0.22} />
            <text x="22" y={y + 4} textAnchor="end" fontSize="11" fill="currentColor" fillOpacity={esActual ? 0.9 : 0.35} fontFamily="var(--font-plex-mono)">
              {String(n).padStart(2, '0')}
            </text>
            {hecha && <circle cx="160" cy={y} r="2.5" fill="currentColor" fillOpacity="0.45" />}
          </g>
        )
      })}
      <rect x="80" y={paso * (paradas - actual + 1) - 26} width="60" height="52" rx="4" fill="var(--color-accent)" />
      <line x1="110" y1={paso * (paradas - actual + 1) - 20} x2="110" y2={paso * (paradas - actual + 1) + 20} stroke="white" strokeOpacity="0.35" />
    </svg>
  )
}
