'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Phone, MessageCircle, Mail, MapPin, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/toast'
import { ElegirFecha } from '@/components/forms/segmentado'
import { registrarContacto } from '@/lib/actions/presupuestos'
import { registrarNotaObra } from '@/lib/actions/obras'
import type { TipoContacto } from '@/lib/dominio'
import { cn } from '@/lib/utils'

const TIPOS: { valor: TipoContacto; label: string; icono: React.ComponentType<{ className?: string }> }[] = [
  { valor: 'llamada', label: 'Llamada', icono: Phone },
  { valor: 'whatsapp', label: 'WhatsApp', icono: MessageCircle },
  { valor: 'mail', label: 'Mail', icono: Mail },
  { valor: 'visita', label: 'Visita', icono: MapPin },
  { valor: 'nota', label: 'Nota', icono: StickyNote },
]

const PLACEHOLDER: Record<TipoContacto, string> = {
  llamada: '¿Qué te dijeron?',
  whatsapp: '¿Qué te respondieron?',
  mail: '¿Qué enviaste o recibiste?',
  visita: '¿Qué se vio en la visita?',
  nota: 'Escribí una nota…',
}

export function Composer({
  destino,
  hoy,
  seguimientoActual,
  tipoInicial = 'llamada',
  onListo,
  autoFocus,
}: {
  destino: { presupuestoId: string } | { obraId: string }
  hoy: string
  seguimientoActual?: string | null
  tipoInicial?: TipoContacto
  onListo?: () => void
  autoFocus?: boolean
}) {
  const router = useRouter()
  const toast = useToast()
  const [pendiente, start] = useTransition()
  const esPresupuesto = 'presupuestoId' in destino
  const [tipo, setTipo] = useState<TipoContacto>(esPresupuesto ? tipoInicial : 'nota')
  const [texto, setTexto] = useState('')
  const sugerida = (() => {
    const f = new Date(`${hoy}T12:00:00Z`)
    f.setUTCDate(f.getUTCDate() + 7)
    return f.toISOString().slice(0, 10)
  })()
  const [seguimiento, setSeguimiento] = useState<string | null>(seguimientoActual && seguimientoActual > hoy ? seguimientoActual : sugerida)
  const [error, setError] = useState<string>()

  function guardar() {
    setError(undefined)
    start(async () => {
      const r = esPresupuesto ? await registrarContacto(destino.presupuestoId, tipo, texto, seguimiento) : await registrarNotaObra(destino.obraId, tipo, texto)
      if (!r.ok) return setError(r.error)
      setTexto('')
      toast(tipo === 'nota' ? 'Nota guardada' : 'Contacto registrado')
      router.refresh()
      onListo?.()
    })
  }

  const tipos = esPresupuesto ? TIPOS : [TIPOS[4], ...TIPOS.slice(0, 4)]

  return (
    <div className="rounded-surface border border-line-strong bg-surface shadow-surface focus-within:border-ink/30">
      <div className="flex gap-1 overflow-x-auto border-b border-line p-1.5 [scrollbar-width:none]">
        {tipos.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTipo(t.valor)}
            aria-pressed={tipo === t.valor}
            className={cn(
              'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium transition-colors',
              tipo === t.valor ? 'bg-ink text-white' : 'text-ink-3 hover:bg-ink/[0.05] hover:text-ink'
            )}
          >
            <t.icono className="size-3.5" />
            {t.label}
          </button>
        ))}
      </div>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) guardar()
        }}
        data-autofocus={autoFocus || undefined}
        placeholder={PLACEHOLDER[tipo]}
        rows={2}
        className="block w-full resize-none bg-transparent px-4 py-3 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-3/80 [field-sizing:content] min-h-[76px]"
      />
      <div className="flex flex-col gap-3 border-t border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        {esPresupuesto ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-ink-3">Próximo seguimiento</span>
            <ElegirFecha
              valor={seguimiento}
              onChange={setSeguimiento}
              hoy={hoy}
              opciones={[
                { dias: 1, label: 'Mañana' },
                { dias: 3, label: '3 días' },
                { dias: 7, label: '1 semana' },
              ]}
            />
          </div>
        ) : (
          <span className="hidden text-[12px] text-ink-3 sm:inline">⌘ + Enter para guardar</span>
        )}
        <div className="flex items-center gap-3 sm:self-end">
          {error && <span className="text-[13px] text-bad">{error}</span>}
          <Button variante="primary" onClick={guardar} cargando={pendiente} className="max-sm:w-full max-sm:justify-center">
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}
