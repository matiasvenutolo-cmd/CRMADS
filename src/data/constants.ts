import type { Tipologia, Localidad, TipoPuerta } from '@/types'

export const TIPOLOGIAS: Tipologia[] = [
  'Ascensor electromecánico',
  'Ascensor hidráulico',
  'Sin sala de máquinas',
  'Monta vehículos',
  'Monta camillas',
  'Montacargas',
  'Monta platos / papeles',
]

export const LOCALIDADES: Localidad[] = [
  'Lanús Oeste',
  'Lanús Este',
  'CABA',
  'Banfield',
  'Avellaneda',
  'Villa Gesell',
  'Mar del Plata',
  'Tortuguitas',
]

export const TIPOS_PUERTA: TipoPuerta[] = ['Automática telescópica', 'Automática central', 'Batiente manual']

export const ETAPAS_OBRA_NOMBRES = [
  'Presupuesto aprobado / anticipo',
  'Relevamiento y ingeniería',
  'Planos y aprobaciones',
  'Fabricación en planta (Lanús)',
  'Obra civil lista',
  'Entrega en obra',
  'Montaje',
  'Pruebas y puesta en marcha',
  'Documentación y entrega final',
] as const

export const OBRA_CIVIL_ITEMS = [
  'Foso',
  'Hueco a plomo',
  'Sala de máquinas',
  'Alimentación eléctrica',
  'Iluminación del hueco',
]

export const EXPEDIENTE_ITEMS = [
  'Solicitud de habilitación',
  'Memoria técnica',
  'Planos conforme a obra',
  'Certificados de componentes',
  'Póliza de responsabilidad civil',
  'Acta de inspección final',
]

export const MOTIVOS_PERDIDA = ['Precio', 'Plazo', 'Eligió otra empresa', 'Obra postergada'] as const
