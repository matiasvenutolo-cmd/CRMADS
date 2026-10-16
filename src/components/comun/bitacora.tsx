import { Phone, MessageCircle, Mail, MapPin, StickyNote, ArrowRightLeft, Layers, Paperclip, Dot } from 'lucide-react'
import { momento } from '@/lib/fechas'
import { TIPOS_CONTACTO } from '@/lib/dominio'
import { cn } from '@/lib/utils'

const ICONOS: Record<string, React.ComponentType<{ className?: string }>> = {
  llamada: Phone,
  whatsapp: MessageCircle,
  mail: Mail,
  visita: MapPin,
  nota: StickyNote,
  estado: ArrowRightLeft,
  etapa: Layers,
  archivo: Paperclip,
  sistema: Dot,
}

export type ItemBitacora = { id: string; tipo: string; texto: string; createdAt: Date; autor: string | null; origen?: string }

export function Bitacora({ items }: { items: ItemBitacora[] }) {
  if (!items.length) return <p className="py-6 text-center text-[14px] text-ink-3">Todavía no hay movimientos.</p>
  return (
    <ol className="relative">
      {items.map((it, i) => {
        const Icono = ICONOS[it.tipo] ?? Dot
        const humano = it.tipo in TIPOS_CONTACTO
        const destacado = humano || it.tipo === 'etapa' || it.tipo === 'estado'
        return (
          <li key={it.id} className="relative flex gap-3.5 pb-5 last:pb-0">
            {i < items.length - 1 && <span className="absolute bottom-0 left-[15px] top-8 w-px bg-line" aria-hidden />}
            <span
              className={cn(
                'relative z-[1] mt-0.5 flex size-[31px] shrink-0 items-center justify-center rounded-full border',
                humano ? 'border-line-strong bg-surface text-ink-2' : it.tipo === 'etapa' ? 'border-accent/25 bg-accent-soft text-accent' : 'border-line bg-subtle text-ink-3'
              )}
            >
              <Icono className="size-[15px]" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className={cn('whitespace-pre-line break-words', destacado ? 'text-[14.5px] text-ink' : 'text-[13.5px] text-ink-2')}>{it.texto}</p>
              <p className="mt-0.5 text-[12.5px] text-ink-3">
                {humano && <span className="font-medium text-ink-2">{TIPOS_CONTACTO[it.tipo as keyof typeof TIPOS_CONTACTO]} · </span>}
                {momento(it.createdAt)}
                {it.autor && ` · ${it.autor}`}
                {it.origen && ` · ${it.origen}`}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
