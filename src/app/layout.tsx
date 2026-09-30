import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ADS Obras | CRM de obras',
  description: 'Prototipo de CRM de obras para Ascensores del Sur — seguimiento de presupuestos, obras y facturación.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  )
}
