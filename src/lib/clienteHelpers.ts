import type { Presupuesto, Obra } from '@/types'

export function presupuestosDeCliente(presupuestos: Presupuesto[], clienteId: string) {
  return presupuestos.filter((p) => p.clienteId === clienteId)
}

export function obrasDeCliente(obras: Obra[], clienteId: string) {
  return obras.filter((o) => o.clienteId === clienteId)
}

export function tasaAprobacion(presupuestos: Presupuesto[]): number | null {
  const decididos = presupuestos.filter((p) => p.estado === 'Aprobado' || p.estado === 'Perdido')
  if (decididos.length === 0) return null
  const aprobados = decididos.filter((p) => p.estado === 'Aprobado').length
  return Math.round((aprobados / decididos.length) * 100)
}

export function saldoPendienteDeCliente(obras: Obra[]): number {
  return obras.reduce((acc, o) => acc + o.planPagos.filter((h) => h.estado !== 'Cobrado').reduce((a, h) => a + h.monto, 0), 0)
}
