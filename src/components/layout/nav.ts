import { LayoutDashboard, FileText, HardHat, Users, Receipt, Calculator, ClipboardList } from 'lucide-react'

export const NAV_OBRAS = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/presupuestos', label: 'Presupuestos', icon: FileText },
  { href: '/obras', label: 'Obras', icon: HardHat },
  { href: '/clientes', label: 'Clientes', icon: Users },
]

export const NAV_HERRAMIENTAS = [
  { href: '/facturacion', label: 'Facturación', icon: Receipt },
  { href: '/cotizador', label: 'Cotizador', icon: Calculator },
  { href: '/parte-de-obra', label: 'Parte de obra', icon: ClipboardList },
]

export const NAV_MOBILE = [
  { href: '/', label: 'Inicio', icon: LayoutDashboard },
  { href: '/presupuestos', label: 'Presup.', icon: FileText },
  { href: '/obras', label: 'Obras', icon: HardHat },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/facturacion', label: 'Factura.', icon: Receipt },
]
