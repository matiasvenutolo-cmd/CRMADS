import type { Tipologia, TipoPuerta, DatosTecnicos } from '@/types'

const BASE_TIPOLOGIA: Record<Tipologia, number> = {
  'Ascensor electromecánico': 14000000,
  'Ascensor hidráulico': 11000000,
  'Sin sala de máquinas': 16000000,
  'Monta vehículos': 20000000,
  'Monta camillas': 15000000,
  Montacargas: 9000000,
  'Monta platos / papeles': 4000000,
}

const MULT_VELOCIDAD: Record<string, number> = {
  '0.3 m/s': 1,
  '0.5 m/s': 1.05,
  '0.63 m/s': 1.1,
  '1 m/s': 1.2,
  '1.6 m/s': 1.4,
}

const EXTRA_PUERTA: Record<TipoPuerta, number> = {
  'Automática telescópica': 1500000,
  'Automática central': 800000,
  'Batiente manual': 0,
}

export function estimarPrecio(dt: Omit<DatosTecnicos, 'direccion' | 'localidad'>): number {
  const base = BASE_TIPOLOGIA[dt.tipologia]
  const mult = MULT_VELOCIDAD[dt.velocidad] ?? 1.15
  const subtotal = base + dt.cargaKg * 8000 + dt.paradas * 900000 + dt.recorridoM * 150000 + EXTRA_PUERTA[dt.tipoPuertas]
  return Math.round((subtotal * mult * dt.cantidadEquipos) / 10000) * 10000
}
