'use server'

import { and, asc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { clientes, etapas, obras } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'
import { ETAPAS_OBRA, TIPOS_CONTACTO, type TipoContacto } from '@/lib/dominio'
import { fechaCorta, hoyISO } from '@/lib/fechas'
import { enteroOpcional, fechaOpcional, registrarEvento, textoLimpio, type Resultado } from './comun'

export type ObraInput = {
  clienteId?: string
  clienteNuevo?: string
  direccion: string
  localidad?: string
  tipologia: string
  cantidadEquipos?: number | string
  cargaKg?: number | string
  paradas?: number | string
  velocidad?: string
  fechaInicio: string
  fechaFinEstimada?: string
  etapaActual?: number
  notas?: string
}

function validar(i: ObraInput) {
  const direccion = textoLimpio(i.direccion)
  const tipologia = textoLimpio(i.tipologia)
  if (!direccion) return { error: 'Falta la obra o dirección.' }
  if (!tipologia) return { error: 'Elegí la tipología.' }
  return {
    datos: {
      direccion,
      localidad: textoLimpio(i.localidad),
      tipologia,
      cantidadEquipos: enteroOpcional(i.cantidadEquipos) || 1,
      cargaKg: enteroOpcional(i.cargaKg),
      paradas: enteroOpcional(i.paradas),
      velocidad: textoLimpio(i.velocidad),
      fechaInicio: fechaOpcional(i.fechaInicio) ?? hoyISO(),
      fechaFinEstimada: fechaOpcional(i.fechaFinEstimada),
      notas: textoLimpio(i.notas),
    },
  }
}

/** Alta directa: para cargar obras que ya estaban en curso antes del sistema. */
export async function crearObra(input: ObraInput): Promise<Resultado<{ id: string }>> {
  const u = await getUsuarioActual()
  const v = validar(input)
  if ('error' in v) return { ok: false, error: v.error! }
  const nombreNuevo = textoLimpio(input.clienteNuevo)
  if (!input.clienteId && !nombreNuevo) return { ok: false, error: 'Elegí o creá el cliente.' }
  const actual = Math.min(Math.max(Number(input.etapaActual) || 1, 1), ETAPAS_OBRA.length)

  const id = await db.transaction(async (tx) => {
    let clienteId = input.clienteId
    if (!clienteId) {
      const [c] = await tx.insert(clientes).values({ nombre: nombreNuevo! }).returning({ id: clientes.id })
      clienteId = c.id
    }
    const [o] = await tx.insert(obras).values({ ...v.datos, clienteId }).returning({ id: obras.id })
    await tx.insert(etapas).values(
      ETAPAS_OBRA.map((nombre, i) => ({
        obraId: o.id,
        orden: i + 1,
        nombre,
        estado: i + 1 < actual ? 'completa' : i + 1 === actual ? 'en_curso' : 'pendiente',
      }))
    )
    await registrarEvento(tx, { obraId: o.id, tipo: 'sistema', texto: `Obra cargada en la etapa ${actual}: ${ETAPAS_OBRA[actual - 1]}`, usuarioId: u.id })
    return o.id
  })
  revalidatePath('/', 'layout')
  return { ok: true, data: { id } }
}

export async function editarObra(id: string, input: ObraInput): Promise<Resultado> {
  const u = await getUsuarioActual()
  const v = validar(input)
  if ('error' in v) return { ok: false, error: v.error! }
  await db.transaction(async (tx) => {
    await tx.update(obras).set({ ...v.datos, updatedAt: new Date() }).where(eq(obras.id, id))
    await registrarEvento(tx, { obraId: id, tipo: 'sistema', texto: 'Datos de la obra editados', usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function completarEtapa(obraId: string, etapaId: string, fecha: string, nota: string): Promise<Resultado<{ terminada: boolean }>> {
  const u = await getUsuarioActual()
  const f = fechaOpcional(fecha) ?? hoyISO()
  const lista = await db.select().from(etapas).where(eq(etapas.obraId, obraId)).orderBy(asc(etapas.orden))
  const etapa = lista.find((e) => e.id === etapaId)
  if (!etapa || etapa.estado !== 'en_curso') return { ok: false, error: 'Esa etapa no está en curso.' }
  const siguiente = lista.find((e) => e.orden === etapa.orden + 1)
  const extra = textoLimpio(nota)

  await db.transaction(async (tx) => {
    await tx.update(etapas).set({ estado: 'completa', fechaFin: f }).where(eq(etapas.id, etapa.id))
    if (siguiente) {
      await tx.update(etapas).set({ estado: 'en_curso', fechaInicio: f }).where(eq(etapas.id, siguiente.id))
    } else {
      await tx.update(obras).set({ estado: 'terminada', fechaFin: f, updatedAt: new Date() }).where(eq(obras.id, obraId))
    }
    await tx.update(obras).set({ updatedAt: new Date() }).where(eq(obras.id, obraId))
    await registrarEvento(tx, {
      obraId,
      tipo: 'etapa',
      texto: `Etapa ${etapa.orden} completa: ${etapa.nombre}${siguiente ? ` · sigue ${siguiente.nombre}` : ' · obra terminada'}${extra ? `. ${extra}` : ''}`,
      usuarioId: u.id,
    })
  })
  revalidatePath('/', 'layout')
  return { ok: true, data: { terminada: !siguiente } }
}

/** Deshace el último avance (por si se completó una etapa por error). */
export async function volverEtapa(obraId: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  const lista = await db.select().from(etapas).where(eq(etapas.obraId, obraId)).orderBy(asc(etapas.orden))
  const enCurso = lista.find((e) => e.estado === 'en_curso')
  const ultimaCompleta = [...lista].reverse().find((e) => e.estado === 'completa')
  if (!ultimaCompleta) return { ok: false, error: 'No hay etapas para volver atrás.' }

  await db.transaction(async (tx) => {
    if (enCurso) await tx.update(etapas).set({ estado: 'pendiente', fechaInicio: null }).where(eq(etapas.id, enCurso.id))
    await tx.update(etapas).set({ estado: 'en_curso', fechaFin: null }).where(eq(etapas.id, ultimaCompleta.id))
    await tx.update(obras).set({ estado: 'en_curso', fechaFin: null, updatedAt: new Date() }).where(eq(obras.id, obraId))
    await registrarEvento(tx, { obraId, tipo: 'etapa', texto: `Se volvió a la etapa ${ultimaCompleta.orden}: ${ultimaCompleta.nombre}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function fijarFechaPrevista(obraId: string, etapaId: string, fecha: string | null): Promise<Resultado> {
  const u = await getUsuarioActual()
  const f = fechaOpcional(fecha)
  const [e] = await db
    .update(etapas)
    .set({ fechaPrevista: f })
    .where(and(eq(etapas.id, etapaId), eq(etapas.obraId, obraId)))
    .returning({ nombre: etapas.nombre })
  if (!e) return { ok: false, error: 'No existe la etapa.' }
  await registrarEvento(db, { obraId, tipo: 'sistema', texto: f ? `${e.nombre}: prevista para el ${fechaCorta(f)}` : `${e.nombre}: sin fecha prevista`, usuarioId: u.id })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function registrarNotaObra(obraId: string, tipo: TipoContacto, texto: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  const limpio = textoLimpio(texto)
  if (!(tipo in TIPOS_CONTACTO)) return { ok: false, error: 'Tipo no válido.' }
  if (!limpio) return { ok: false, error: 'Escribí la nota.' }
  await registrarEvento(db, { obraId, tipo, texto: limpio, usuarioId: u.id })
  await db.update(obras).set({ updatedAt: new Date() }).where(eq(obras.id, obraId))
  revalidatePath('/', 'layout')
  return { ok: true }
}

/** Ubica la obra en una etapa (para obras cargadas en la etapa equivocada). */
export async function fijarEtapaActual(obraId: string, orden: number): Promise<Resultado> {
  const u = await getUsuarioActual()
  const lista = await db.select().from(etapas).where(eq(etapas.obraId, obraId)).orderBy(asc(etapas.orden))
  const destino = lista.find((e) => e.orden === orden)
  if (!destino) return { ok: false, error: 'Etapa no válida.' }
  const anterior = lista.find((e) => e.estado === 'en_curso')
  if (anterior?.orden === orden) return { ok: true }

  await db.transaction(async (tx) => {
    for (const e of lista) {
      if (e.orden < orden && e.estado !== 'completa') await tx.update(etapas).set({ estado: 'completa' }).where(eq(etapas.id, e.id))
      if (e.orden === orden) await tx.update(etapas).set({ estado: 'en_curso', fechaFin: null }).where(eq(etapas.id, e.id))
      if (e.orden > orden && e.estado !== 'pendiente') await tx.update(etapas).set({ estado: 'pendiente', fechaInicio: null, fechaFin: null }).where(eq(etapas.id, e.id))
    }
    await tx.update(obras).set({ estado: 'en_curso', fechaFin: null, updatedAt: new Date() }).where(eq(obras.id, obraId))
    await registrarEvento(tx, { obraId, tipo: 'etapa', texto: `Etapa actual cambiada a ${orden}: ${destino.nombre}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}
