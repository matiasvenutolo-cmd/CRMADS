/**
 * Carga la base inicial del cotizador (catálogo, precios base, textos y parámetros)
 * a partir del JSON armado con el análisis de los Excel y Word de ADS.
 *   node scripts/semilla-cotizador.mjs <ruta-al-json>
 * Es idempotente: sólo carga en las tablas que están vacías. El JSON no se versiona
 * porque tiene costos de ADS.
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

if (!process.env.DATABASE_URL_UNPOOLED) process.loadEnvFile('.env.local')
const ruta = process.argv[2]
if (!ruta) {
  console.error('Uso: node scripts/semilla-cotizador.mjs <ruta-al-json>')
  process.exit(1)
}
const s = JSON.parse(readFileSync(ruta, 'utf8'))
const sql = postgres(process.env.DATABASE_URL_UNPOOLED, { prepare: false, max: 1 })

await sql.begin(async (tx) => {
  const vacia = async (t) => (await tx.unsafe(`select count(*)::int n from ${t}`))[0].n === 0
  if (await vacia('cotizador_items')) {
    for (const i of s.items) await tx`insert into cotizador_items (categoria, nombre, costo, orden) values (${i.categoria}, ${i.nombre}, ${i.costo}, ${i.orden})`
    console.log('ítems', s.items.length)
  }
  if (await vacia('cotizador_bases')) {
    for (const b of s.bases) await tx`insert into cotizador_bases (tipo, paradas, precio, detalle, fuente) values (${b.tipo}, ${b.paradas}, ${b.precio}, ${b.detalle}, ${b.fuente})`
    console.log('precios base', s.bases.length)
  }
  if (await vacia('cotizador_textos')) {
    for (const t of s.textos) await tx`insert into cotizador_textos (grupo, seccion, tipos, variante, texto, orden, por_defecto) values (${t.grupo}, ${t.seccion}, ${t.tipos}, ${t.variante}, ${t.texto}, ${t.orden}, ${t.porDefecto})`
    console.log('textos', s.textos.length)
  }
  for (const [clave, valor] of Object.entries(s.config)) {
    await tx`insert into cotizador_config (clave, valor) values (${clave}, ${sql.json(valor)}) on conflict (clave) do nothing`
  }
  console.log('parámetros', Object.keys(s.config).length)
})
await sql.end()
