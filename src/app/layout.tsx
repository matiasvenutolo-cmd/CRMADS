import type { Metadata, Viewport } from 'next'
import { Inter, Barlow_Condensed } from 'next/font/google'
import './globals.css'

const sans = Inter({ subsets: ['latin'], variable: '--font-texto', display: 'swap' })
const display = Barlow_Condensed({ subsets: ['latin'], weight: ['500', '600', '700', '800'], style: ['normal', 'italic'], variable: '--font-titulo', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'ADS Obras', template: '%s · ADS Obras' },
  description: 'Seguimiento de presupuestos y obras de Ascensores del Sur.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f4f6f7',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${sans.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  )
}
