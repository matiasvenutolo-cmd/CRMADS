'use client'

import { FileText, HardHat, ArrowRight } from 'lucide-react'
import { useNuevo } from '@/components/shell/nuevo'
import { HuecoIlustracion } from '@/components/hueco'

export function PrimerosPasos() {
  const { abrir } = useNuevo()
  const pasos = [
    { n: '01', t: 'Cargá un presupuesto', d: 'Cliente, dirección, tipología y monto. Con eso alcanza para empezar a seguirlo.' },
    { n: '02', t: 'Registrá cada contacto', d: 'Cada llamada o mail queda en el historial, y el sistema te avisa cuándo volver a llamar.' },
    { n: '03', t: 'Ganalo y convertilo en obra', d: 'Un clic y la obra arranca con sus 9 etapas, hasta la puesta en marcha.' },
  ]
  return (
    <section className="relative overflow-hidden rounded-[20px] banda text-white">
      <HuecoIlustracion className="pointer-events-none absolute -right-10 -top-24 hidden h-[640px] text-white lg:block" actual={1} />
      <div className="relative max-w-[640px] px-6 py-9 md:px-10 md:py-12">
        <p className="kicker kicker-claro">Para empezar</p>
        <h2 className="mt-3 font-serif text-[32px] leading-[1.08] md:text-[40px]">Todavía no hay nada cargado. Arranquemos por lo que tengas en la mano.</h2>
        <ol className="mt-8 grid gap-5 md:grid-cols-3 md:gap-6">
          {pasos.map((p) => (
            <li key={p.n} className="border-t border-white/15 pt-3">
              <span className="font-mono text-[13px] text-naranja">{p.n}</span>
              <p className="mt-1 font-serif text-[19px]">{p.t}</p>
              <p className="mt-1 text-[13.5px] leading-relaxed text-white/60">{p.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-9 flex flex-wrap gap-2.5">
          <button type="button" onClick={() => abrir('presupuesto')} className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-5 text-[14px] font-medium text-ink transition-colors hover:bg-white/90">
            <FileText className="size-4" />
            Cargar el primer presupuesto
            <ArrowRight className="size-4" />
          </button>
          <button type="button" onClick={() => abrir('obra')} className="flex h-11 cursor-pointer items-center gap-2 rounded-full border border-white/20 px-5 text-[14px] font-medium text-white transition-colors hover:bg-white/10">
            <HardHat className="size-4" />
            Cargar una obra en curso
          </button>
        </div>
      </div>
    </section>
  )
}
