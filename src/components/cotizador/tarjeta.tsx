'use client'

import Link from 'next/link'
import { ArrowRight, Download, FileText, Sparkles } from 'lucide-react'
import { usePuedeEditar } from '@/components/shell/permisos'

/** En la ficha del presupuesto: invita a probar el cotizador, o resume la cotización si ya existe. */
export function TarjetaCotizador({ presupuestoId, resumen }: { presupuestoId: string; resumen: { unitario: number; total: number; cantidad: number; margenPct: number; actualizada: string; importada?: boolean } | null }) {
  const puedeEditar = usePuedeEditar()
  const usd = (v: number) => `US$ ${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(v))}`
  if (!resumen) {
    if (!puedeEditar) return null
    return (
      <Link href={`/presupuestos/${presupuestoId}/cotizador`} className="group block overflow-hidden rounded-surface border border-dashed border-accent/40 bg-accent-soft/60 p-4 transition-colors hover:border-accent hover:bg-accent-soft">
        <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wide text-accent">
          <Sparkles className="size-3.5" /> Nuevo · Cotizador online
        </p>
        <p className="mt-1.5 text-[14.5px] font-medium text-ink">Armá este presupuesto en el sistema</p>
        <p className="mt-0.5 text-[13px] text-ink-3">Costos, precio y el documento en Word o PDF, sin Excel. Arranca con los valores de siempre.</p>
        <span className="mt-2.5 inline-flex items-center gap-1 text-[13.5px] font-medium text-accent">
          Probar el cotizador <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    )
  }
  return (
    <div className="banda overflow-hidden rounded-surface text-white shadow-surface">
      <Link href={`/presupuestos/${presupuestoId}/cotizador`} className="group block px-5 pb-4 pt-4">
        <p className="kicker kicker-claro">{resumen.importada ? 'Cotización · de tus archivos' : 'Cotización'}</p>
        <p className="mt-1.5 font-serif text-[30px] leading-none">{usd(resumen.unitario)}</p>
        <p className="mt-1 text-[12.5px] text-white/70">
          {resumen.cantidad > 1 ? `por equipo · total ${usd(resumen.total)} · ` : ''}margen {Math.round(resumen.margenPct * 100)}% · {resumen.importada ? 'importada del Excel y el Word' : resumen.actualizada}
        </p>
        <span className="mt-2.5 inline-flex items-center gap-1 text-[13.5px] font-medium">
          {resumen.importada ? 'Ver la cotización' : 'Abrir cotizador'} <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
      <div className="grid grid-cols-2 border-t border-white/15 text-[13px] font-medium">
        <a href={`/cotizacion/${presupuestoId}/word`} className="flex items-center justify-center gap-1.5 border-r border-white/15 py-2.5 hover:bg-white/10">
          <FileText className="size-4" /> Word
        </a>
        <a href={`/cotizacion/${presupuestoId}/pdf?ver`} target="_blank" rel="noopener" className="flex items-center justify-center gap-1.5 py-2.5 hover:bg-white/10">
          <Download className="size-4" /> PDF
        </a>
      </div>
    </div>
  )
}
