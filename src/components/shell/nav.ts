import { Sun, FileText, HardHat, Building2 } from 'lucide-react'

export const NAV = [
  { href: '/', label: 'Hoy', icono: Sun },
  { href: '/presupuestos', label: 'Presupuestos', icono: FileText },
  { href: '/obras', label: 'Obras', icono: HardHat },
  { href: '/clientes', label: 'Clientes', icono: Building2 },
] as const

export function activo(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)
}
