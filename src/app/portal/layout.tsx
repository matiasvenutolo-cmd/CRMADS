import Image from 'next/image'

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="flex items-center gap-2 border-b border-line bg-white px-5 py-4">
        <Image src="/logo/ads-logo.png" alt="ADS" width={57} height={32} />
        <div>
          <p className="font-display text-sm font-bold leading-tight text-ink">Ascensores del Sur</p>
          <p className="text-[11px] leading-tight text-muted">Portal de seguimiento de obra</p>
        </div>
      </header>
      {children}
    </div>
  )
}
