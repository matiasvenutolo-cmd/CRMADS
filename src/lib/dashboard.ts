import type { Presupuesto, Obra, EventoHistorial } from '@/types'
import { montoActual } from '@/data/presupuestos'
import { HOY, diasDesde } from './format'
import { obraAtrasada, etapaActual } from './obraHelpers'
import { todosLosHitos, resumenFacturacion } from './facturacionHelpers'

export function presupuestosAbiertos(presupuestos: Presupuesto[]) {
  return presupuestos.filter((p) => p.estado !== 'Aprobado' && p.estado !== 'Perdido')
}

export function tasaAprobacion90d(presupuestos: Presupuesto[]): number | null {
  const decididos = presupuestos.filter((p) => (p.estado === 'Aprobado' || p.estado === 'Perdido') && diasDesde(p.fechaEnvio) <= 90)
  if (decididos.length === 0) return null
  return Math.round((decididos.filter((p) => p.estado === 'Aprobado').length / decididos.length) * 100)
}

export function presupuestosSinRespuesta(presupuestos: Presupuesto[]) {
  return presupuestos.filter((p) => (p.estado === 'Enviado' || p.estado === 'En negociación') && diasDesde(p.fechaEnvio) > 7).sort((a, b) => diasDesde(b.fechaEnvio) - diasDesde(a.fechaEnvio))
}

export function obrasAtrasadas(obras: Obra[]) {
  return obras.filter(obraAtrasada)
}

export function hitosDeLaSemana(obras: Obra[]) {
  return obras
    .flatMap((o) => o.etapas.filter((e) => e.estado !== 'completa').map((e) => ({ etapa: e, obra: o })))
    .filter(({ etapa }) => {
      const d = diasDesde(HOY, etapa.fechaPrevista)
      return d >= 0 && d <= 7
    })
    .sort((a, b) => (a.etapa.fechaPrevista < b.etapa.fechaPrevista ? -1 : 1))
}

export function cobrosVencidos(obras: Obra[]) {
  return todosLosHitos(obras).filter((h) => h.hito.estado === 'Facturado' && h.hito.comprobante && diasDesde(h.hito.comprobante.fecha) > 30)
}

export function actividadReciente(presupuestos: Presupuesto[], obras: Obra[], limite = 8) {
  const eventos: (EventoHistorial & { contexto: string; href: string })[] = []
  presupuestos.forEach((p) => p.historial.forEach((e) => eventos.push({ ...e, contexto: p.numero, href: `/presupuestos/${p.id}` })))
  obras.forEach((o) => o.historial.forEach((e) => eventos.push({ ...e, contexto: o.numero, href: `/obras/${o.id}` })))
  return eventos.sort((a, b) => (a.fecha < b.fecha ? 1 : -1)).slice(0, limite)
}

export function presupuestosPorEstado(presupuestos: Presupuesto[]) {
  const estados: Presupuesto['estado'][] = ['Borrador', 'Enviado', 'En negociación', 'Aprobado', 'Perdido']
  return estados.map((estado) => ({ estado, cantidad: presupuestos.filter((p) => p.estado === estado).length }))
}

export function obrasPorEtapa(obras: Obra[]) {
  const conteo = new Map<string, number>()
  obras.forEach((o) => {
    const nombre = etapaActual(o).nombre
    conteo.set(nombre, (conteo.get(nombre) ?? 0) + 1)
  })
  return Array.from(conteo.entries()).map(([etapa, cantidad]) => ({ etapa, cantidad }))
}

export function montoAbiertoTotal(presupuestos: Presupuesto[]) {
  return presupuestosAbiertos(presupuestos).reduce((acc, p) => acc + montoActual(p), 0)
}

export function kpisTablero(presupuestos: Presupuesto[], obras: Obra[]) {
  const abiertos = presupuestosAbiertos(presupuestos)
  const resumenFact = resumenFacturacion(obras)
  return {
    presupuestosAbiertos: abiertos.length,
    montoAbierto: abiertos.reduce((acc, p) => acc + montoActual(p), 0),
    tasaAprobacion: tasaAprobacion90d(presupuestos),
    obrasEnCurso: obras.filter((o) => !obraAtrasada(o) && etapaActual(o).estado !== 'completa').length,
    obrasAtrasadas: obrasAtrasadas(obras).length,
    aFacturar: resumenFact.aFacturar,
    pendienteDeCobro: resumenFact.pendienteDeCobro,
  }
}
