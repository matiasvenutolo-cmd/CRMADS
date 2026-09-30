'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-md',
  titulo,
}: {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  maxWidth?: string
  titulo?: string
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className={cn('animate-pop-in max-h-[90vh] w-full overflow-y-auto rounded-card border border-line bg-white shadow-2xl', maxWidth)} onClick={(e) => e.stopPropagation()}>
        {titulo && (
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">{titulo}</h2>
            <button onClick={onClose} className="text-muted hover:text-ink">
              <X size={18} />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
