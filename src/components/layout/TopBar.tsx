'use client'

import Image from 'next/image'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/Button'
import { Search, RotateCcw, Sparkles } from 'lucide-react'

export function TopBar() {
  const setComandoAbierto = useStore((s) => s.setComandoAbierto)
  const reset = useStore((s) => s.reset)
  const setDemoPaso = useStore((s) => s.setDemoPaso)

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-white/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Image src="/logo/ads-logo.png" alt="ADS" width={50} height={28} />
        <span className="font-display text-sm font-bold text-ink">ADS Obras</span>
      </div>

      <button
        onClick={() => setComandoAbierto(true)}
        className="flex flex-1 items-center gap-2 rounded-[10px] border border-line bg-paper px-3 py-2 text-sm text-muted md:max-w-sm"
      >
        <Search size={15} />
        <span className="hidden sm:inline">Buscar cliente, obra o presupuesto...</span>
        <span className="sm:hidden">Buscar...</span>
        <kbd className="ml-auto hidden rounded border border-line bg-white px-1.5 py-0.5 text-[10px] font-medium text-muted sm:inline">⌘K</kbd>
      </button>

      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setDemoPaso(0)} className="hidden sm:flex">
          <Sparkles size={14} /> Ver recorrido
        </Button>
        <Button variant="ghost" size="sm" onClick={reset} title="Restablecer datos de ejemplo">
          <RotateCcw size={14} />
          <span className="hidden md:inline">Restablecer</span>
        </Button>
      </div>
    </header>
  )
}
