import { cn } from '@/lib/utils'

export function Surface({ className, children, as: Tag = 'section' }: { className?: string; children: React.ReactNode; as?: 'section' | 'div' | 'article' }) {
  return <Tag className={cn('rounded-surface border border-line bg-surface shadow-surface', className)}>{children}</Tag>
}

export function SurfaceHeader({ titulo, accion, className }: { titulo: React.ReactNode; accion?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex min-h-12 items-center justify-between gap-3 border-b border-line px-5 py-2.5', className)}>
      <h2 className="font-serif text-[17px] leading-tight text-ink">{titulo}</h2>
      {accion}
    </div>
  )
}

export function Etiqueta({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('kicker', className)}>{children}</p>
}

export function Vacio({ titulo, texto, accion, icono }: { titulo: string; texto?: string; accion?: React.ReactNode; icono?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {icono && <div className="mb-4 flex size-11 items-center justify-center rounded-full border border-line bg-subtle text-ink-3">{icono}</div>}
      <p className="font-serif text-[24px] leading-tight text-ink">{titulo}</p>
      {texto && <p className="mt-1.5 max-w-sm text-[14px] text-ink-3">{texto}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  )
}
