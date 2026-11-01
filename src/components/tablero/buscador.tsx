'use client'

import { Search } from 'lucide-react'
import { useBusqueda } from '@/components/shell/busqueda'

/** Buscador a mano en el tablero: abre la misma búsqueda que la lupa (⌘K). */
export function BuscadorTablero() {
  const { abrir } = useBusqueda()
  return (
    <button
      type="button"
      onClick={abrir}
      className="mb-6 flex h-14 w-full cursor-pointer items-center gap-3 rounded-surface border border-line-strong bg-surface px-5 text-left text-[15px] text-ink-3 shadow-surface transition-colors hover:border-accent/50 hover:text-ink-2"
    >
      <Search className="size-5 shrink-0 text-accent" />
      <span className="min-w-0 flex-1 truncate">
        Buscar un presupuesto u obra: constructor, calle o N° ADS
      </span>
      <kbd className="hidden rounded border border-line px-1.5 font-mono text-[11px] md:inline">⌘K</kbd>
    </button>
  )
}
