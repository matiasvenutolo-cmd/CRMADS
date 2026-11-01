import { ETAPAS_OBRA } from '@/lib/dominio'
import { fechaCorta } from '@/lib/fechas'

type PagoBase = { fechaPrevista: string | null; etapaOrden: number | null; fechaCobro: string | null }
type EtapaBase = { orden: number; estado: string; fechaFin: string | null }

export type EstadoPago = 'cobrado' | 'vencido' | 'a_cobrar' | 'sujeto' | 'sin_fecha'

/**
 * Cuándo es exigible un pago y en qué estado está. Si depende de una etapa,
 * vence el día en que esa etapa se completó; mientras tanto queda «sujeto» a la etapa.
 */
export function estadoPago(p: PagoBase, etapas: EtapaBase[], hoy: string): { estado: EstadoPago; vence: string | null; texto: string } {
  if (p.fechaCobro) return { estado: 'cobrado', vence: p.fechaPrevista, texto: `Cobrado el ${fechaCorta(p.fechaCobro)}` }
  let vence = p.fechaPrevista
  if (p.etapaOrden) {
    const e = etapas.find((x) => x.orden === p.etapaOrden)
    const nombre = ETAPAS_OBRA[p.etapaOrden - 1] ?? `etapa ${p.etapaOrden}`
    if (e?.estado === 'completa') vence = e.fechaFin ?? vence
    else if (!vence) return { estado: 'sujeto', vence: null, texto: `Al completar «${nombre}»` }
  }
  if (!vence) return { estado: 'sin_fecha', vence: null, texto: 'Sin fecha' }
  return vence < hoy ? { estado: 'vencido', vence, texto: `Vencido el ${fechaCorta(vence)}` } : { estado: 'a_cobrar', vence, texto: `A cobrar el ${fechaCorta(vence)}` }
}
