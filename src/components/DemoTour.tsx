'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { DEMO_STEPS } from '@/lib/demoSteps'
import { Button } from './ui/Button'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'

export function DemoTour() {
  const paso = useStore((s) => s.demoPaso)
  const setPaso = useStore((s) => s.setDemoPaso)
  const router = useRouter()

  useEffect(() => {
    if (paso !== null) router.push(DEMO_STEPS[paso].ruta)
  }, [paso, router])

  if (paso === null) return null
  const step = DEMO_STEPS[paso]

  return (
    <div className="fixed inset-x-0 bottom-16 z-[250] flex justify-center px-4 md:bottom-6">
      <div className="animate-fade-in flex w-full max-w-xl flex-col gap-3 rounded-card border border-line bg-white p-4 shadow-2xl sm:flex-row sm:items-center">
        <div className="flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-orange">
            Recorrido · Paso {paso + 1} de {DEMO_STEPS.length}
          </p>
          <p className="font-display text-base font-bold text-ink">{step.titulo}</p>
          <p className="text-sm text-muted">{step.texto}</p>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPaso(null)} aria-label="Salir del recorrido">
            <X size={15} />
          </Button>
          <Button variant="secondary" size="sm" disabled={paso === 0} onClick={() => setPaso(paso - 1)}>
            <ArrowLeft size={14} />
          </Button>
          {paso < DEMO_STEPS.length - 1 ? (
            <Button variant="primary" size="sm" onClick={() => setPaso(paso + 1)}>
              Siguiente <ArrowRight size={14} />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={() => setPaso(null)}>
              Terminar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
