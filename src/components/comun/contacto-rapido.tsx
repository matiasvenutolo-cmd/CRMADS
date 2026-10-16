import { Phone, MessageCircle, Mail } from 'lucide-react'
import { soloDigitos } from '@/lib/formato'

export function ContactoRapido({ telefono, email }: { telefono: string | null; email: string | null }) {
  if (!telefono && !email) return <p className="mt-2 text-[13px] text-ink-3">Sin teléfono ni mail cargados.</p>
  const tel = telefono ? soloDigitos(telefono) : ''
  const wa = tel ? (tel.startsWith('54') ? tel : `549${tel.replace(/^0/, '')}`) : ''
  const clase = 'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-control border border-line-strong text-[13px] font-medium text-ink-2 transition-colors hover:border-ink/30 hover:text-ink'
  return (
    <>
      <p className="mt-2 text-[13px] text-ink-3">{[telefono, email].filter(Boolean).join(' · ')}</p>
      <div className="mt-3 flex gap-2">
        {tel && (
          <a href={`tel:${tel}`} className={clase}>
            <Phone className="size-3.5" /> Llamar
          </a>
        )}
        {tel && (
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener" className={clase}>
            <MessageCircle className="size-3.5" /> WhatsApp
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className={clase}>
            <Mail className="size-3.5" /> Mail
          </a>
        )}
      </div>
    </>
  )
}
