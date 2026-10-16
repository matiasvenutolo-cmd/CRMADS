'use client'

import { createContext, useCallback, useContext, useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'

type Toast = { id: number; texto: string; tipo: 'ok' | 'error' }
const Ctx = createContext<(texto: string, tipo?: Toast['tipo']) => void>(() => {})

export function useToast() {
  return useContext(Ctx)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const mostrar = useCallback((texto: string, tipo: Toast['tipo'] = 'ok') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, texto, tipo }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])

  return (
    <Ctx.Provider value={mostrar}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className="flex animate-enter items-center gap-2.5 rounded-full bg-ink py-2.5 pl-3.5 pr-4 text-[13.5px] font-medium text-white shadow-float">
            {t.tipo === 'ok' ? <Check className="size-4 text-[#7fd1a0]" /> : <AlertCircle className="size-4 text-[#f3a49c]" />}
            {t.texto}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
