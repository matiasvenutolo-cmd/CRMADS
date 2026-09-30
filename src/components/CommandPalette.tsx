'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useStore } from '@/store/useStore'
import { CLIENTES } from '@/data/clientes'
import { Search, FileText, HardHat, Users, X } from 'lucide-react'
import { formatMoney } from '@/lib/format'
import { montoActual } from '@/data/presupuestos'

export function CommandPalette() {
  const abierto = useStore((s) => s.comandoAbierto)
  const setAbierto = useStore((s) => s.setComandoAbierto)
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)
  const [query, setQuery] = useState('')
  const router = useRouter()

  function cerrar() {
    setAbierto(false)
    setQuery('')
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setAbierto(true)
      }
      if (e.key === 'Escape') cerrar()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setAbierto])

  const q = query.trim().toLowerCase()

  const resultadosClientes = useMemo(() => (q ? CLIENTES.filter((c) => c.nombre.toLowerCase().includes(q)).slice(0, 5) : []), [q])
  const resultadosPresupuestos = useMemo(
    () => (q ? presupuestos.filter((p) => p.numero.toLowerCase().includes(q) || CLIENTES.find((c) => c.id === p.clienteId)?.nombre.toLowerCase().includes(q)).slice(0, 5) : []),
    [q, presupuestos]
  )
  const resultadosObras = useMemo(
    () => (q ? obras.filter((o) => o.numero.toLowerCase().includes(q) || CLIENTES.find((c) => c.id === o.clienteId)?.nombre.toLowerCase().includes(q)).slice(0, 5) : []),
    [q, obras]
  )

  if (!abierto) return null

  function ir(href: string) {
    router.push(href)
    cerrar()
  }

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center bg-black/40 px-4 pt-24" onClick={cerrar}>
      <div className="animate-pop-in w-full max-w-lg overflow-hidden rounded-card border border-line bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cliente, obra o número de presupuesto..."
            className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <button onClick={cerrar} className="text-muted hover:text-ink">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {!q && <p className="px-3 py-6 text-center text-sm text-muted">Escribí para buscar en todo el CRM</p>}
          {q && resultadosClientes.length === 0 && resultadosPresupuestos.length === 0 && resultadosObras.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-muted">Sin resultados para &quot;{query}&quot;</p>
          )}

          {resultadosObras.length > 0 && (
            <Grupo titulo="Obras">
              {resultadosObras.map((o) => (
                <Resultado key={o.id} icon={HardHat} titulo={`${o.numero} · ${CLIENTES.find((c) => c.id === o.clienteId)?.nombre}`} sub={o.datosTecnicos.direccion} onClick={() => ir(`/obras/${o.id}`)} />
              ))}
            </Grupo>
          )}
          {resultadosPresupuestos.length > 0 && (
            <Grupo titulo="Presupuestos">
              {resultadosPresupuestos.map((p) => (
                <Resultado
                  key={p.id}
                  icon={FileText}
                  titulo={`${p.numero} · ${CLIENTES.find((c) => c.id === p.clienteId)?.nombre}`}
                  sub={formatMoney(montoActual(p))}
                  onClick={() => ir(`/presupuestos/${p.id}`)}
                />
              ))}
            </Grupo>
          )}
          {resultadosClientes.length > 0 && (
            <Grupo titulo="Clientes">
              {resultadosClientes.map((c) => (
                <Resultado key={c.id} icon={Users} titulo={c.nombre} sub={c.localidad} onClick={() => ir(`/clientes/${c.id}`)} />
              ))}
            </Grupo>
          )}
        </div>
      </div>
    </div>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted">{titulo}</p>
      {children}
    </div>
  )
}

function Resultado({ icon: Icon, titulo, sub, onClick }: { icon: React.ComponentType<{ size?: number }>; titulo: string; sub?: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm hover:bg-paper">
      <Icon size={16} />
      <span className="flex-1 truncate">
        <span className="font-medium text-ink">{titulo}</span>
        {sub && <span className="ml-2 text-muted">{sub}</span>}
      </span>
    </button>
  )
}
