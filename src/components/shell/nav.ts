import { Sun, FileText, HardHat, Building2, ChartColumn } from 'lucide-react'

export const NAV = [
  { href: '/', label: 'Hoy', icono: Sun },
  { href: '/presupuestos', label: 'Presupuestos', icono: FileText },
  { href: '/obras', label: 'Obras', icono: HardHat },
  { href: '/clientes', label: 'Clientes', icono: Building2 },
] as const

// Gerardo (dirección) entra al tablero; no carga, pero puede consultar todo.
export const NAV_DIRECCION = [{ href: '/tablero', label: 'Tablero', icono: ChartColumn }, ...NAV.slice(1)] as const

// Fabricio también ve el tablero: en escritorio como última pestaña (la barra del celular no cambia).
export const NAV_GESTION = [...NAV, { href: '/tablero', label: 'Tablero', icono: ChartColumn }] as const

export function activo(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
