'use client'

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { resumenDeLaSemana, PREGUNTAS_SUGERIDAS, preguntaSobreObra } from '@/lib/asistente'
import { Sparkles, Send } from 'lucide-react'

interface Mensaje {
  pregunta: string
  respuesta: string
}

export function AsistentePanel() {
  const presupuestos = useStore((s) => s.presupuestos)
  const obras = useStore((s) => s.obras)
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [texto, setTexto] = useState('')

  const resumen = resumenDeLaSemana(presupuestos, obras)

  function preguntar(pregunta: string, responder?: (p: typeof presupuestos, o: typeof obras) => string) {
    const respuesta = responder ? responder(presupuestos, obras) : preguntaSobreObra(obras, pregunta) ?? 'No tengo datos suficientes para responder eso todavía, probá con el nombre de un cliente u obra.'
    setMensajes((m) => [...m, { pregunta, respuesta }])
    setTexto('')
  }

  return (
    <Card id="asistente">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles size={17} className="text-brand-orange" /> Asistente
        </CardTitle>
      </CardHeader>
      <CardBody className="space-y-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Resumen de la semana</p>
          <ul className="space-y-1.5 text-sm text-ink">
            {resumen.map((linea, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-orange">·</span> {linea}
              </li>
            ))}
          </ul>
        </div>

        {mensajes.length > 0 && (
          <div className="space-y-3 border-t border-line pt-3">
            {mensajes.map((m, i) => (
              <div key={i}>
                <p className="text-sm font-medium text-ink">{m.pregunta}</p>
                <p className="text-sm text-muted">{m.respuesta}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {PREGUNTAS_SUGERIDAS.map((p) => (
            <button
              key={p.pregunta}
              onClick={() => preguntar(p.pregunta, p.responder)}
              className="rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-line/60"
            >
              {p.pregunta}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (texto.trim()) preguntar(texto.trim())
          }}
        >
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Preguntale algo al asistente..."
            className="flex-1 rounded-[10px] border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand-blue"
          />
          <Button variant="primary" size="sm" type="submit">
            <Send size={14} />
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
