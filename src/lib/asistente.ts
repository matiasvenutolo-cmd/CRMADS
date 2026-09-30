import type { Presupuesto, Obra } from '@/types'
import { clientePorId } from '@/data/clientes'
import { montoActual } from '@/data/presupuestos'
import { formatMoney } from './format'
import { obrasAtrasadas, presupuestosSinRespuesta, hitosDeLaSemana } from './dashboard'
import { todosLosHitos } from './facturacionHelpers'
import { etapaActual, progresoObra } from './obraHelpers'

export function resumenDeLaSemana(presupuestos: Presupuesto[], obras: Obra[]): string[] {
  const lineas: string[] = []

  const completadasEstaSemana = obras.flatMap((o) => o.etapas.filter((e) => e.estado === 'completa')).length
  lineas.push(`Esta semana el equipo avanzó ${completadasEstaSemana} etapas entre todas las obras en curso.`)

  const atrasadas = obrasAtrasadas(obras)
  if (atrasadas.length > 0) {
    const nombres = atrasadas.map((o) => `${o.numero} (${clientePorId(o.clienteId)?.nombre})`).join(', ')
    lineas.push(`Hay ${atrasadas.length} obra${atrasadas.length > 1 ? 's' : ''} atrasada${atrasadas.length > 1 ? 's' : ''}: ${nombres}.`)
  } else {
    lineas.push('No hay obras atrasadas por ahora.')
  }

  const sinRespuesta = presupuestosSinRespuesta(presupuestos)
  if (sinRespuesta.length > 0) {
    lineas.push(`${sinRespuesta.length} presupuesto${sinRespuesta.length > 1 ? 's' : ''} llevan más de 7 días sin respuesta del cliente, el más antiguo es ${sinRespuesta[0].numero}.`)
  }

  const listos = todosLosHitos(obras).filter((h) => h.hito.estado === 'Listo para facturar')
  if (listos.length > 0) {
    const total = listos.reduce((a, h) => a + h.hito.monto, 0)
    lineas.push(`Hay ${listos.length} hito${listos.length > 1 ? 's' : ''} listo${listos.length > 1 ? 's' : ''} para facturar por ${formatMoney(total)}.`)
  }

  const semana = hitosDeLaSemana(obras)
  if (semana.length > 0) {
    lineas.push(`${semana.length} hito${semana.length > 1 ? 's' : ''} de obra vencen en los próximos 7 días.`)
  }

  return lineas
}

export interface PreguntaSugerida {
  pregunta: string
  responder: (presupuestos: Presupuesto[], obras: Obra[]) => string
}

export const PREGUNTAS_SUGERIDAS: PreguntaSugerida[] = [
  {
    pregunta: '¿Qué hay para facturar este mes?',
    responder: (_p, obras) => {
      const listos = todosLosHitos(obras).filter((h) => h.hito.estado === 'Listo para facturar')
      if (listos.length === 0) return 'No hay hitos listos para facturar en este momento.'
      const total = listos.reduce((a, h) => a + h.hito.monto, 0)
      return `Hay ${listos.length} hito(s) listos para facturar por un total de ${formatMoney(total)}: ${listos.map((h) => `${h.obra.numero} (${h.hito.nombre})`).join(', ')}.`
    },
  },
  {
    pregunta: '¿Qué obras están atrasadas?',
    responder: (_p, obras) => {
      const atrasadas = obrasAtrasadas(obras)
      if (atrasadas.length === 0) return 'Ninguna obra está atrasada hoy.'
      return atrasadas
        .map((o) => {
          const etapa = o.etapas.find((e) => e.estado === 'atrasada')
          return `${o.numero} (${clientePorId(o.clienteId)?.nombre}) está atrasada en "${etapa?.nombre}".`
        })
        .join(' ')
    },
  },
  {
    pregunta: '¿Qué presupuestos esperan respuesta?',
    responder: (presupuestos) => {
      const sinRespuesta = presupuestosSinRespuesta(presupuestos)
      if (sinRespuesta.length === 0) return 'Todos los presupuestos enviados tienen seguimiento al día.'
      return sinRespuesta.map((p) => `${p.numero} (${clientePorId(p.clienteId)?.nombre}) — ${formatMoney(montoActual(p))}`).join(', ')
    },
  },
]

export function preguntaSobreObra(obras: Obra[], texto: string): string | null {
  const q = texto.toLowerCase()
  const obra = obras.find((o) => clientePorId(o.clienteId)?.nombre.toLowerCase().split(' ').some((palabra) => palabra.length > 3 && q.includes(palabra.toLowerCase())))
  if (!obra) return null
  const actual = etapaActual(obra)
  return `${obra.numero} (${clientePorId(obra.clienteId)?.nombre}) está en "${actual?.nombre}", con ${progresoObra(obra)}% de avance.`
}
