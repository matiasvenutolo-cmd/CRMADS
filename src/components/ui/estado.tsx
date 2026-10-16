import { ESTADOS_PRESUPUESTO, type EstadoPresupuesto } from '@/lib/dominio'
import { cn } from '@/lib/utils'

export function Punto({ color, className }: { color: string; className?: string }) {
  return <span className={cn('inline-block size-[7px] shrink-0 rounded-full', className)} style={{ background: color }} aria-hidden />
}

export function EstadoPresupuestoLabel({ estado, className }: { estado: string; className?: string }) {
  const e = ESTADOS_PRESUPUESTO[estado as EstadoPresupuesto] ?? ESTADOS_PRESUPUESTO.borrador
  return (
    <span className={cn('inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-ink-2', className)}>
      <Punto color={e.color} />
      {e.label}
    </span>
  )
}

export function Aviso({ children, tono = 'warn' }: { children: React.ReactNode; tono?: 'warn' | 'bad' | 'ok' | 'accent' }) {
  const tonos = {
    warn: 'bg-warn-soft text-warn',
    bad: 'bg-bad-soft text-bad',
    ok: 'bg-ok-soft text-ok',
    accent: 'bg-accent-soft text-accent',
  }
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-medium', tonos[tono])}>{children}</span>
}
