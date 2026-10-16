import type { Metadata, Viewport } from 'next'
import { Instrument_Sans, Instrument_Serif, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-instrument-sans', display: 'swap' })
const serif = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-instrument-serif', display: 'swap' })
const mono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-plex-mono', display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'ADS Obras', template: '%s · ADS Obras' },
  description: 'Seguimiento de presupuestos y obras de Ascensores del Sur.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#f4f3ef',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
