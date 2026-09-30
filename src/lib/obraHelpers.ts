import type { Obra } from '@/types'

export function etapaActual(obra: Obra) {
  return obra.etapas.find((e) => e.estado !== 'completa') ?? obra.etapas[obra.etapas.length - 1]
}

export function progresoObra(obra: Obra): number {
  const completas = obra.etapas.filter((e) => e.estado === 'completa').length
  return Math.round((completas / obra.etapas.length) * 100)
}

export function obraAtrasada(obra: Obra): boolean {
  return obra.etapas.some((e) => e.estado === 'atrasada')
}

export function saldoPendienteCliente(obra: Obra): number {
  return obra.planPagos.filter((h) => h.estado !== 'Cobrado').reduce((acc, h) => acc + h.monto, 0)
}
