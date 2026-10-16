'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Modal sobre <dialog> nativo (foco, Esc y backdrop resueltos por el navegador).
 * - "dialogo": centrado, para confirmaciones cortas.
 * - "hoja": panel lateral en escritorio, pantalla completa desde abajo en el celular.
 */
export function Panel({
  abierto,
  onCerrar,
  titulo,
  descripcion,
  variante = 'dialogo',
  pie,
  children,
  className,
}: {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  descripcion?: string
  variante?: 'dialogo' | 'hoja'
  pie?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (abierto && !d.open) {
      d.showModal()
      // showModal enfoca el primer botón (cerrar); preferimos el campo marcado para escribir.
      requestAnimationFrame(() => d.querySelector<HTMLElement>('[data-autofocus]')?.focus())
    }
    if (!abierto && d.open) d.close()
  }, [abierto])

  const hoja = variante === 'hoja'

  return (
    <dialog
      ref={ref}
      onClose={onCerrar}
      onClick={(e) => {
        if (e.target === ref.current) onCerrar()
      }}
      className={cn(
        'm-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-ink/30 backdrop:backdrop-blur-[2px] backdrop:animate-fade',
        hoja ? 'h-dvh w-full md:ml-auto md:w-[520px]' : 'fixed inset-0 m-auto h-fit w-[calc(100%-32px)] max-w-[440px]'
      )}
    >
      {abierto && (
        <div
          className={cn(
            'flex flex-col bg-surface',
            hoja
              ? 'h-full animate-sheet-up md:animate-sheet md:border-l md:border-line md:shadow-float'
              : 'max-h-[85dvh] animate-enter rounded-surface shadow-float',
            className
          )}
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-5 md:px-6">
            <div>
              <h2 className="font-serif text-[24px] leading-[1.1] text-ink">{titulo}</h2>
              {descripcion && <p className="mt-1 text-[13.5px] text-ink-3">{descripcion}</p>}
            </div>
            <button type="button" onClick={onCerrar} aria-label="Cerrar" className="-mr-1.5 flex size-8 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink">
              <X className="size-[18px]" />
            </button>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6">{children}</div>
          {pie && <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-line bg-subtle px-5 py-3.5 pb-[max(14px,env(safe-area-inset-bottom))] md:px-6">{pie}</footer>}
        </div>
      )}
    </dialog>
  )
}
