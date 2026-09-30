'use client'

import { useStore } from '@/store/useStore'
import { CheckCircle2, Info } from 'lucide-react'

export function Toaster() {
  const toasts = useStore((s) => s.toasts)

  return (
    <div className="fixed bottom-20 left-1/2 z-[200] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fade-in flex items-center gap-2 rounded-[10px] border border-line bg-white px-4 py-3 text-sm font-medium text-ink shadow-lg"
        >
          {t.tipo === 'success' ? <CheckCircle2 size={16} className="text-success shrink-0" /> : <Info size={16} className="text-brand-blue shrink-0" />}
          {t.mensaje}
        </div>
      ))}
    </div>
  )
}
