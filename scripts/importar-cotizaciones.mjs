/**
 * Carga como cotizaciones los presupuestos que ya tenían Excel y Word (armado por el análisis
 * de esos archivos). No toca montos, estados ni archivos: sólo agrega la cotización donde no hay.
 *   node scripts/importar-cotizaciones.mjs <ruta-al-json>        carga
 *   node scripts/importar-cotizaciones.mjs --deshacer             borra las importadas
 * El JSON no se versiona porque tiene costos de ADS.
 */
import { readFileSync } from 'node:fs'
import postgres from 'postgres'

if (!process.env.DATABASE_URL_UNPOOLED) process.loadEnvFile('.env.local')
const sql = postgres(process.env.DATABASE_URL_UNPOOLED, { prepare: false, max: 1 })
const arg = process.argv[2]

if (arg === '--deshacer') {
  const r = await sql`delete from cotizaciones where datos->'origen'->>'tipo' = 'importada' returning presupuesto_id`
  console.log('borradas', r.length)
} else if (arg) {
  const lista = JSON.parse(readFileSync(arg, 'utf8')).filter((x) => x.regular)
  let n = 0
  await sql.begin(async (tx) => {
    for (const x of lista) {
      const r = await tx`insert into cotizaciones (presupuesto_id, datos) values (${x.presupuestoId}, ${sql.json(x.datos)}) on conflict (presupuesto_id) do nothing returning presupuesto_id`
      n += r.length
    }
  })
  console.log('importadas', n, 'de', lista.length)
} else {
  console.error('Uso: node scripts/importar-cotizaciones.mjs <ruta-al-json> | --deshacer')
  process.exitCode = 1
}
await sql.end()
