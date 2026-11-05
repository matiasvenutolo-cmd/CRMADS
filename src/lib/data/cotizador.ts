import 'server-only'
import { asc, eq } from 'drizzle-orm'
import { db } from '@/lib/db/client'
import { cotizaciones, cotizadorBases, cotizadorConfig, cotizadorItems, cotizadorTextos, usuarios } from '@/lib/db/schema'
import type { ConfigCotizador, Cotizacion } from '@/lib/cotizador/modelo'
import type { Catalogo } from '@/lib/cotizador/nueva'

// Valores por defecto si todavía no se cargó la base inicial.
const CONFIG_BASE: ConfigCotizador = {
  coeficiente: 1.2,
  actualizacion: 1,
  redondeo: 50,
  descuento_proveedor: { electromecanico: 0.7695, hidraulico: 0.7695, monta_vehiculos: 1, monta_platos: 0.7695 },
  mano_obra: { fijo: 4715, por_parada: 503 },
  iva: '10,50%',
  validez: '10 Días.',
  pago: 'A convenir.',
  plazo: 'Según avance de obra y Punto Nº 8 de las Condiciones Generales.',
  lugar: 'Lanús',
  ficha: { electromecanico: [], hidraulico: [], monta_vehiculos: [], monta_platos: [] },
}

export async function getCatalogo(): Promise<Catalogo> {
  const [items, bases, textos, config] = await Promise.all([
    db.select().from(cotizadorItems).orderBy(asc(cotizadorItems.categoria), asc(cotizadorItems.orden), asc(cotizadorItems.nombre)),
    db.select().from(cotizadorBases).orderBy(asc(cotizadorBases.tipo), asc(cotizadorBases.paradas)),
    db.select().from(cotizadorTextos).orderBy(asc(cotizadorTextos.grupo), asc(cotizadorTextos.orden)),
    db.select().from(cotizadorConfig),
  ])
  const cfg = { ...CONFIG_BASE, ...Object.fromEntries(config.map((c) => [c.clave, c.valor])) } as ConfigCotizador
  return { items, bases, textos, config: cfg }
}

export async function getCotizacion(presupuestoId: string) {
  const [c] = await db
    .select({ datos: cotizaciones.datos, updatedAt: cotizaciones.updatedAt, autor: usuarios.nombre })
    .from(cotizaciones)
    .leftJoin(usuarios, eq(usuarios.id, cotizaciones.usuarioId))
    .where(eq(cotizaciones.presupuestoId, presupuestoId))
  return c ? { ...c, datos: c.datos as Cotizacion } : null
}
