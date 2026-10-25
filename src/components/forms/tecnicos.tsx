'use client'

import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Field, Input } from '@/components/ui/field'
import { cn } from '@/lib/utils'

export type Tecnicos = { cargaKg: string; paradas: string; velocidad: string }

export function CamposTecnicos({ valor, onChange, abiertoInicial }: { valor: Tecnicos; onChange: (v: Tecnicos) => void; abiertoInicial?: boolean }) {
  const [abierto, setAbierto] = useState(abiertoInicial ?? Boolean(valor.cargaKg || valor.paradas || valor.velocidad))
  return (
    <div className="rounded-control border border-line">
      <button type="button" onClick={() => setAbierto((a) => !a)} aria-expanded={abierto} className="flex w-full cursor-pointer items-center justify-between px-3.5 py-3 text-left">
        <span className="text-[13.5px] font-medium text-ink-2">
          Datos técnicos <span className="font-normal text-ink-3">· opcional</span>
        </span>
        <ChevronRight className={cn('size-4 text-ink-3 transition-transform', abierto && 'rotate-90')} />
      </button>
      {abierto && (
        <div className="grid grid-cols-3 gap-3 border-t border-line px-3.5 pb-3.5 pt-3">
          <Field label="Carga (kg)" htmlFor="t-carga">
            <Input id="t-carga" inputMode="numeric" value={valor.cargaKg} onChange={(e) => onChange({ ...valor, cargaKg: e.target.value.replace(/\D/g, '') })} placeholder="630" />
          </Field>
          <Field label="Paradas" htmlFor="t-paradas">
            <Input id="t-paradas" inputMode="numeric" value={valor.paradas} onChange={(e) => onChange({ ...valor, paradas: e.target.value.replace(/\D/g, '') })} placeholder="8" />
          </Field>
          <Field label="Velocidad (m/s)" htmlFor="t-vel">
            <Input id="t-vel" value={valor.velocidad} onChange={(e) => onChange({ ...valor, velocidad: e.target.value })} inputMode="decimal" placeholder="1" />
          </Field>
        </div>
      )}
    </div>
  )
}
