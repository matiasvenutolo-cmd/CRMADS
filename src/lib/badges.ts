export type BadgeTone = 'blue' | 'orange' | 'success' | 'danger' | 'muted' | 'ink'

export const TONE_CLASSES: Record<BadgeTone, string> = {
  blue: 'bg-brand-blue/10 text-brand-blue',
  orange: 'bg-brand-orange/15 text-[#8a5610]',
  success: 'bg-success-bg text-success',
  danger: 'bg-danger-bg text-danger',
  muted: 'bg-line/60 text-muted',
  ink: 'bg-ink/10 text-ink',
}

export const TONE_PRESUPUESTO: Record<string, BadgeTone> = {
  Borrador: 'muted',
  Enviado: 'blue',
  'En negociación': 'orange',
  Aprobado: 'success',
  Perdido: 'danger',
}

export const TONE_ETAPA: Record<string, BadgeTone> = {
  pendiente: 'muted',
  en_curso: 'blue',
  completa: 'success',
  atrasada: 'danger',
}

export const LABEL_ETAPA: Record<string, string> = {
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  completa: 'Completa',
  atrasada: 'Atrasada',
}

export const TONE_HITO: Record<string, BadgeTone> = {
  Pendiente: 'muted',
  'Listo para facturar': 'orange',
  Facturado: 'blue',
  Cobrado: 'success',
}

export const TONE_ADICIONAL: Record<string, BadgeTone> = {
  Pendiente: 'orange',
  Aprobado: 'success',
  Rechazado: 'danger',
}
