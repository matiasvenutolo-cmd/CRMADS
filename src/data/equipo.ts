import type { Persona } from '@/types'

export const EQUIPO: Persona[] = [
  { id: 'pers-01', nombre: 'Lucas Ferreiro', rol: 'comercial', iniciales: 'LF' },
  { id: 'pers-02', nombre: 'Agustina Roldán', rol: 'comercial', iniciales: 'AR' },
  { id: 'pers-03', nombre: 'Mariano Suárez', rol: 'responsable_obra', iniciales: 'MS' },
  { id: 'pers-04', nombre: 'Victoria Lamas', rol: 'responsable_obra', iniciales: 'VL' },
  { id: 'pers-05', nombre: 'Tomás Bianchi', rol: 'ingenieria', iniciales: 'TB' },
  { id: 'pers-06', nombre: 'Carla Domínguez', rol: 'direccion', iniciales: 'CD' },
]

export function personaPorId(id: string): Persona | undefined {
  return EQUIPO.find((p) => p.id === id)
}

export const ROL_LABEL: Record<Persona['rol'], string> = {
  comercial: 'Comercial',
  responsable_obra: 'Responsable de obra',
  ingenieria: 'Ingeniería',
  direccion: 'Dirección',
}
