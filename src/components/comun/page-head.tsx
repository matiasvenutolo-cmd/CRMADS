import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export function PageHead({ titulo, antetitulo, descripcion, acciones, volver }: { titulo: React.ReactNode; antetitulo?: React.ReactNode; descripcion?: React.ReactNode; acciones?: React.ReactNode; volver?: { href: string; label: string } }) {
  return (
    <div className="mb-7 md:mb-9">
      {volver && (
        <Link href={volver.href} className="-ml-1 mb-4 inline-flex items-center gap-0.5 rounded-full py-1 pl-0.5 pr-2.5 text-[13px] font-medium text-ink-3 transition-colors hover:text-ink">
          <ChevronLeft className="size-4" />
          {volver.label}
        </Link>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          {antetitulo && <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-3">{antetitulo}</div>}
          <h1 className="font-serif text-[34px] leading-[1.05] tracking-[-0.01em] text-ink text-balance md:text-[44px]">{titulo}</h1>
          {descripcion && <div className="mt-2 text-[15px] text-ink-2">{descripcion}</div>}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </div>
  )
}

export function Codigo({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[12px] tracking-tight text-ink-3">{children}</span>
}
