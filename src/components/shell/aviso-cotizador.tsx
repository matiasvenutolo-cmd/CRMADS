'use client'

import { useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, X } from 'lucide-react'

// Aviso discreto bajo el encabezado para presentar el cotizador. Se puede cerrar y no vuelve
// (se recuerda en este navegador).
const CLAVE = 'ads-aviso-cotizador-cerrado'
const oyentes = new Set<() => void>()

function leer() {
  try {
    return localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function AvisoCotizador() {
  const cerrado = useSyncExternalStore(
    (cb) => (oyentes.add(cb), () => oyentes.delete(cb)),
    leer,
    () => true
  )
  if (cerrado) return null
  const cerrar = () => {
    try {
      localStorage.setItem(CLAVE, '1')
    } catch {}
    oyentes.forEach((cb) => cb())
  }
  return (
    <div className="border-b border-accent/15 bg-accent-soft/70">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-2 md:px-8">
        <Sparkles className="size-4 shrink-0 text-accent" />
        <p className="min-w-0 flex-1 text-[13px] text-ink-2">
          <span className="font-semibold text-ink">Nuevo: cotizador online.</span> <span className="hidden sm:inline">Armá presupuestos con costos, precio y documento en Word o PDF, sin Excel. </span>
          <Link href="/cotizador" className="inline-flex items-center gap-0.5 font-medium text-accent hover:underline">
            Probalo <ArrowRight className="size-3.5" />
          </Link>
        </p>
        <button type="button" onClick={cerrar} aria-label="Cerrar aviso" className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-ink/5 hover:text-ink">
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
