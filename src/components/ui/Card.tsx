import { cn } from '@/lib/utils'

export function Card({ className, children, id }: { className?: string; children: React.ReactNode; id?: string }) {
  return (
    <div id={id} className={cn('rounded-card border border-line bg-white', className)}>
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-between gap-3 border-b border-line px-5 py-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h3 className={cn('font-display text-lg font-semibold tracking-tight text-ink', className)}>{children}</h3>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>
}
