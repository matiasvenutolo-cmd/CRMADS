import type { Obra, HitoPago } from '@/types'
import { HOY, diasDesde } from './format'

export interface HitoConObra {
  hito: HitoPago
  obra: Obra
}

export function todosLosHitos(obras: Obra[]): HitoConObra[] {
  return obras.flatMap((obra) => obra.planPagos.map((hito) => ({ hito, obra })))
}

const MES_ACTUAL = HOY.slice(0, 7)

export function esDelMesActual(fecha?: string): boolean {
  return !!fecha && fecha.slice(0, 7) === MES_ACTUAL
}

export function resumenFacturacion(obras: Obra[]) {
  const hitos = todosLosHitos(obras)
  const aFacturar = hitos.filter((h) => h.hito.estado === 'Listo para facturar').reduce((a, h) => a + h.hito.monto, 0)
  const facturadoEnMes = hitos.filter((h) => esDelMesActual(h.hito.comprobante?.fecha)).reduce((a, h) => a + h.hito.monto, 0)
  const pendienteDeCobro = hitos.filter((h) => h.hito.estado === 'Facturado').reduce((a, h) => a + h.hito.monto, 0)
  const cobradoEnMes = hitos.filter((h) => esDelMesActual(h.hito.cobro?.fecha)).reduce((a, h) => a + h.hito.monto, 0)
  return { aFacturar, facturadoEnMes, pendienteDeCobro, cobradoEnMes }
}

export function estaVencido(h: HitoConObra): boolean {
  return h.hito.estado === 'Facturado' && !!h.hito.comprobante && diasDesde(h.hito.comprobante.fecha) > 30
}
