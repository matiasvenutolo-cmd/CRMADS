'use client'

import Link from 'next/link'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Pestanas({ opciones, actual }: { opciones: { valor: string; label: string; n?: number }[]; actual: string }) {
  const params = useSearchParams()
  const pathname = usePathname()
  return (
    <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:px-0">
      {opciones.map((o) => {
        const p = new URLSearchParams(params)
        p.set('filtro', o.valor)
        const on = o.valor === actual
        return (
          <Link
            key={o.valor}
            href={`${pathname}?${p}`}
            scroll={false}
            aria-current={on ? 'page' : undefined}
            className={cn(
              'flex h-9 shrink-0 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-medium transition-colors',
              on ? 'bg-brand text-white' : 'text-ink-3 hover:bg-ink/[0.05] hover:text-ink'
            )}
          >
            {o.label}
            {o.n != null && <span className={cn('tabular text-[12px]', on ? 'text-white/60' : 'text-ink-3/80')}>{o.n}</span>}
          </Link>
        )
      })}
    </div>
  )
}

export function BuscadorLista({ placeholder }: { placeholder: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      if ((params.get('q') ?? '') === q) return
      const p = new URLSearchParams(params)
      if (q) p.set('q', q)
      else p.delete('q')
      router.replace(`${pathname}?${p}`, { scroll: false })
    }, 250)
    return () => clearTimeout(t)
  }, [q, params, pathname, router])

  return (
    <div className="relative w-full md:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-full border border-line bg-surface pl-9 pr-8 text-[13.5px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/10"
      />
      {q && (
        <button type="button" onClick={() => setQ('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-ink/5">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  )
}
