import { ETAPAS_OBRA } from '@/lib/dominio'
import { Aviso } from '@/components/ui/estado'

export function EtapasAValidar() {
  return (
    <section className="rounded-surface border border-dashed border-warn-dot/60 bg-surface p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-[24px] leading-tight text-ink">Etapas de cada obra</h2>
        <Aviso>A validar con ADS</Aviso>
      </div>
      <p className="mt-1.5 max-w-2xl text-[13.5px] text-ink-3">Es la propuesta inicial de recorrido para todas las obras. Se ajusta en la reunión de arranque: nombres, orden o etapas que falten o sobren.</p>
      <ol className="mt-5 grid gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {ETAPAS_OBRA.map((e, i) => (
          <li key={e} className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-line-strong font-mono text-[12px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-[14px] text-ink">{e}</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
