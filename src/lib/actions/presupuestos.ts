'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db/client'
import { clientes, etapas, obras, presupuestos } from '@/lib/db/schema'
import { getUsuarioActual } from '@/lib/session'
import { ESTADOS_PRESUPUESTO, ETAPAS_OBRA, TIPOS_CONTACTO, codigoObra, normalizarNumeroAds, type EstadoPresupuesto, type TipoContacto } from '@/lib/dominio'
import { dinero } from '@/lib/formato'
import { fechaCorta, hoyISO } from '@/lib/fechas'
import { enteroOpcional, fechaOpcional, registrarEvento, textoLimpio, type Resultado } from './comun'

export type PresupuestoInput = {
  numeroAds?: string
  clienteId?: string
  clienteNuevo?: string
  direccion: string
  localidad?: string
  tipologia: string
  cantidadEquipos?: number | string
  cargaKg?: number | string
  paradas?: number | string
  velocidad?: string
  monto?: number | string
  moneda: string
  estado?: string
  fechaEnvio?: string
  proximoSeguimiento?: string
  notas?: string
}

function validar(i: PresupuestoInput) {
  const direccion = textoLimpio(i.direccion)
  const tipologia = textoLimpio(i.tipologia)
  if (!direccion) return { error: 'Falta la obra o dirección.' }
  if (!tipologia) return { error: 'Elegí la tipología.' }
  const montoNum = i.monto === '' || i.monto == null ? null : Number(String(i.monto).replace(/\./g, '').replace(',', '.'))
  if (montoNum != null && (!Number.isFinite(montoNum) || montoNum < 0)) return { error: 'El monto no es válido.' }
  const envio = fechaOpcional(i.fechaEnvio)
  if (envio && envio > hoyISO()) return { error: 'La fecha de envío no puede ser futura.' }
  return {
    datos: {
      numeroAds: normalizarNumeroAds(i.numeroAds),
      direccion,
      localidad: textoLimpio(i.localidad),
      tipologia,
      cantidadEquipos: enteroOpcional(i.cantidadEquipos) || 1,
      cargaKg: enteroOpcional(i.cargaKg),
      paradas: enteroOpcional(i.paradas),
      velocidad: textoLimpio(i.velocidad),
      monto: montoNum,
      moneda: i.moneda === 'USD' ? 'USD' : 'ARS',
      fechaEnvio: fechaOpcional(i.fechaEnvio),
      proximoSeguimiento: fechaOpcional(i.proximoSeguimiento),
      notas: textoLimpio(i.notas),
    },
  }
}

export async function crearPresupuesto(input: PresupuestoInput): Promise<Resultado<{ id: string }>> {
  const u = await getUsuarioActual()
  const v = validar(input)
  if ('error' in v) return { ok: false, error: v.error! }
  const nombreNuevo = textoLimpio(input.clienteNuevo)
  if (!input.clienteId && !nombreNuevo) return { ok: false, error: 'Elegí o creá el cliente.' }
  const estado = (input.estado && input.estado in ESTADOS_PRESUPUESTO ? input.estado : 'borrador') as EstadoPresupuesto

  const id = await db.transaction(async (tx) => {
    let clienteId = input.clienteId
    if (!clienteId) {
      const [c] = await tx.insert(clientes).values({ nombre: nombreNuevo! }).returning({ id: clientes.id })
      clienteId = c.id
    }
    const [p] = await tx
      .insert(presupuestos)
      .values({ ...v.datos, clienteId, estado, fechaEnvio: v.datos.fechaEnvio ?? (estado === 'enviado' ? hoyISO() : null) })
      .returning({ id: presupuestos.id })
    await registrarEvento(tx, { presupuestoId: p.id, tipo: 'sistema', texto: `Presupuesto creado (${ESTADOS_PRESUPUESTO[estado].label.toLowerCase()})`, usuarioId: u.id })
    return p.id
  })

  revalidatePath('/', 'layout')
  return { ok: true, data: { id } }
}

export async function editarPresupuesto(id: string, input: PresupuestoInput): Promise<Resultado> {
  const u = await getUsuarioActual()
  const v = validar(input)
  if ('error' in v) return { ok: false, error: v.error! }
  const previo = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, id) })
  if (!previo) return { ok: false, error: 'No existe el presupuesto.' }

  await db.transaction(async (tx) => {
    const fechaEnvio = input.fechaEnvio === undefined ? previo.fechaEnvio : v.datos.fechaEnvio
    const numeroAds = input.numeroAds === undefined ? previo.numeroAds : v.datos.numeroAds
    await tx.update(presupuestos).set({ ...v.datos, fechaEnvio, numeroAds, updatedAt: new Date() }).where(eq(presupuestos.id, id))
    if (fechaEnvio !== previo.fechaEnvio) {
      await registrarEvento(tx, { presupuestoId: id, tipo: 'sistema', texto: fechaEnvio ? `Fecha de envío: ${fechaCorta(fechaEnvio)}` : 'Fecha de envío borrada', usuarioId: u.id })
    }
    if ((previo.monto ?? null) !== v.datos.monto || previo.moneda !== v.datos.moneda) {
      await registrarEvento(tx, {
        presupuestoId: id,
        tipo: 'sistema',
        texto: `Monto actualizado: ${dinero(previo.monto, previo.moneda)} → ${dinero(v.datos.monto, v.datos.moneda)}`,
        usuarioId: u.id,
      })
    } else {
      await registrarEvento(tx, { presupuestoId: id, tipo: 'sistema', texto: 'Datos del presupuesto editados', usuarioId: u.id })
    }
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function cambiarEstado(id: string, estado: EstadoPresupuesto): Promise<Resultado> {
  const u = await getUsuarioActual()
  if (!['borrador', 'enviado', 'negociacion'].includes(estado)) return { ok: false, error: 'Estado no válido.' }
  const p = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, id) })
  if (!p) return { ok: false, error: 'No existe el presupuesto.' }
  if (p.estado === 'ganado') return { ok: false, error: 'El presupuesto ya es una obra.' }

  await db.transaction(async (tx) => {
    await tx
      .update(presupuestos)
      .set({ estado, motivoPerdida: null, fechaEnvio: estado === 'enviado' && !p.fechaEnvio ? hoyISO() : p.fechaEnvio, updatedAt: new Date() })
      .where(eq(presupuestos.id, id))
    await registrarEvento(tx, { presupuestoId: id, tipo: 'estado', texto: `Pasó a ${ESTADOS_PRESUPUESTO[estado].label.toLowerCase()}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function registrarContacto(
  presupuestoId: string,
  tipo: TipoContacto,
  texto: string,
  proximoSeguimiento: string | null
): Promise<Resultado> {
  const u = await getUsuarioActual()
  const limpio = textoLimpio(texto)
  if (!(tipo in TIPOS_CONTACTO)) return { ok: false, error: 'Tipo de contacto no válido.' }
  if (!limpio && tipo === 'nota') return { ok: false, error: 'Escribí la nota.' }
  const fecha = fechaOpcional(proximoSeguimiento)
  const previo = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, presupuestoId), columns: { proximoSeguimiento: true } })
  if (!previo) return { ok: false, error: 'No existe el presupuesto.' }
  const ahora = Date.now()

  await db.transaction(async (tx) => {
    if (fecha !== previo.proximoSeguimiento) {
      await registrarEvento(tx, { presupuestoId, tipo: 'sistema', texto: fecha ? `Próximo seguimiento: ${fechaCorta(fecha)}` : 'Seguimiento sin fecha', usuarioId: u.id, createdAt: new Date(ahora) })
    }
    await registrarEvento(tx, { presupuestoId, tipo, texto: limpio ?? TIPOS_CONTACTO[tipo], usuarioId: u.id, createdAt: new Date(ahora + 1) })
    await tx.update(presupuestos).set({ proximoSeguimiento: fecha, updatedAt: new Date() }).where(eq(presupuestos.id, presupuestoId))
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function reprogramarSeguimiento(presupuestoId: string, fecha: string | null): Promise<Resultado> {
  const u = await getUsuarioActual()
  const f = fechaOpcional(fecha)
  await db.transaction(async (tx) => {
    await tx.update(presupuestos).set({ proximoSeguimiento: f, updatedAt: new Date() }).where(eq(presupuestos.id, presupuestoId))
    await registrarEvento(tx, { presupuestoId, tipo: 'sistema', texto: f ? `Seguimiento reprogramado para el ${fechaCorta(f)}` : 'Seguimiento sin fecha', usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function marcarPerdido(id: string, motivo: string, nota: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  const m = textoLimpio(motivo)
  if (!m) return { ok: false, error: 'Elegí el motivo.' }
  const extra = textoLimpio(nota)
  await db.transaction(async (tx) => {
    await tx.update(presupuestos).set({ estado: 'perdido', motivoPerdida: m, proximoSeguimiento: null, updatedAt: new Date() }).where(eq(presupuestos.id, id))
    await registrarEvento(tx, { presupuestoId: id, tipo: 'estado', texto: `Perdido · ${m}${extra ? `. ${extra}` : ''}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function ganarYCrearObra(id: string, opciones: { fechaInicio: string; fechaFinEstimada?: string; etapaActual?: number }): Promise<Resultado<{ obraId: string }>> {
  const u = await getUsuarioActual()
  const p = await db.query.presupuestos.findFirst({ where: eq(presupuestos.id, id) })
  if (!p) return { ok: false, error: 'No existe el presupuesto.' }
  const existente = await db.query.obras.findFirst({ where: eq(obras.presupuestoId, id), columns: { id: true } })
  if (existente) return { ok: true, data: { obraId: existente.id } }
  const inicio = fechaOpcional(opciones.fechaInicio) ?? hoyISO()
  const actual = Math.min(Math.max(Number(opciones.etapaActual) || 1, 1), ETAPAS_OBRA.length)

  const obraId = await db.transaction(async (tx) => {
    await tx.update(presupuestos).set({ estado: 'ganado', proximoSeguimiento: null, motivoPerdida: null, updatedAt: new Date() }).where(eq(presupuestos.id, id))
    const [o] = await tx
      .insert(obras)
      .values({
        presupuestoId: id,
        clienteId: p.clienteId,
        direccion: p.direccion,
        localidad: p.localidad,
        tipologia: p.tipologia,
        cantidadEquipos: p.cantidadEquipos,
        cargaKg: p.cargaKg,
        paradas: p.paradas,
        velocidad: p.velocidad,
        fechaInicio: inicio,
        fechaFinEstimada: fechaOpcional(opciones.fechaFinEstimada),
      })
      .returning({ id: obras.id, numero: obras.numero })
    await tx.insert(etapas).values(
      ETAPAS_OBRA.map((nombre, i) => ({
        obraId: o.id,
        orden: i + 1,
        nombre,
        estado: i + 1 < actual ? 'completa' : i + 1 === actual ? 'en_curso' : 'pendiente',
        fechaInicio: i === 0 || i + 1 === actual ? (actual === 1 ? inicio : null) : null,
      }))
    )
    await registrarEvento(tx, { presupuestoId: id, tipo: 'estado', texto: `Ganado · se creó la obra ${codigoObra(o.numero)}`, usuarioId: u.id })
    await registrarEvento(tx, {
      obraId: o.id,
      tipo: 'sistema',
      texto: actual === 1 ? 'Obra iniciada a partir del presupuesto aprobado' : `Obra creada desde el presupuesto, en la etapa ${actual}: ${ETAPAS_OBRA[actual - 1]}`,
      usuarioId: u.id,
    })
    return o.id
  })

  revalidatePath('/', 'layout')
  return { ok: true, data: { obraId } }
}

export async function reabrirPresupuesto(id: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  await db.transaction(async (tx) => {
    await tx.update(presupuestos).set({ estado: 'negociacion', motivoPerdida: null, updatedAt: new Date() }).where(eq(presupuestos.id, id))
    await registrarEvento(tx, { presupuestoId: id, tipo: 'estado', texto: 'Reabierto, pasó a en negociación', usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}

export async function cambiarFechaEnvio(id: string, fecha: string): Promise<Resultado> {
  const u = await getUsuarioActual()
  const f = fechaOpcional(fecha)
  if (!f) return { ok: false, error: 'Fecha no válida.' }
  if (f > hoyISO()) return { ok: false, error: 'La fecha de envío no puede ser futura.' }
  await db.transaction(async (tx) => {
    await tx.update(presupuestos).set({ fechaEnvio: f, updatedAt: new Date() }).where(eq(presupuestos.id, id))
    await registrarEvento(tx, { presupuestoId: id, tipo: 'sistema', texto: `Fecha de envío: ${fechaCorta(f)}`, usuarioId: u.id })
  })
  revalidatePath('/', 'layout')
  return { ok: true }
}
