'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Menú desplegable simple: el disparador recibe `abrir`, el contenido se cierra al elegir o al hacer click afuera. */
export function Menu({
  disparador,
  children,
  alinear = 'derecha',
  className,
}: {
  disparador: (props: { abierto: boolean; alternar: () => void }) => React.ReactNode
  children: (cerrar: () => void) => React.ReactNode
  alinear?: 'izquierda' | 'derecha'
  className?: string
}) {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setAbierto(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('keydown', esc)
    }
  }, [abierto])

  return (
    <div ref={ref} className="relative">
      {disparador({ abierto, alternar: () => setAbierto((a) => !a) })}
      {abierto && (
        <div
          role="menu"
          className={cn(
            'absolute top-[calc(100%+6px)] z-50 min-w-[220px] animate-enter rounded-[12px] border border-line bg-surface p-1.5 shadow-float',
            alinear === 'derecha' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
        >
          {children(() => setAbierto(false))}
        </div>
      )}
    </div>
  )
}

export function MenuItem({ children, onClick, icono, peligro }: { children: React.ReactNode; onClick: () => void; icono?: React.ReactNode; peligro?: boolean }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-left text-[14px] transition-colors hover:bg-ink/[0.05]',
        peligro ? 'text-bad' : 'text-ink'
      )}
    >
      {icono && <span className="text-ink-3 [&>svg]:size-4">{icono}</span>}
      {children}
    </button>
  )
}
