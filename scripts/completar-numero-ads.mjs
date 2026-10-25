/**
 * Completa presupuestos.numero_ads a partir de los nombres de sus archivos
 * ("ADS 8608.xls" → 8608). Sólo toca presupuestos sin número y con un único
 * número posible; los ambiguos se dejan para cargar a mano. Idempotente.
 *   node scripts/completar-numero-ads.mjs            → simula
 *   node scripts/completar-numero-ads.mjs --aplicar  → escribe
 * Usa DATABASE_URL_UNPOOLED (o la que se pase por entorno).
 */
import postgres from 'postgres'
if (!process.env.DATABASE_URL_UNPOOLED) process.loadEnvFile('.env.local')
const aplicar = process.argv.includes('--aplicar')
const sql = postgres(process.env.DATABASE_URL_UNPOOLED, { prepare: false, max: 1 })
const num = (n) => (n.match(/ads[\s\-_.]*(\d{3,6})/i) || [])[1]

const ps = await sql`select p.id, p.numero, (select array_agg(nombre) from archivos a where a.presupuesto_id = p.id) archivos from presupuestos p where p.numero_ads is null order by numero`
const asignar = []
const ambiguos = []
for (const p of ps) {
  const ns = [...new Set((p.archivos || []).map(num).filter(Boolean))]
  if (ns.length === 1) asignar.push({ id: p.id, numero: p.numero, ads: ns[0] })
  else if (ns.length > 1) ambiguos.push(`P-${String(p.numero).padStart(4, '0')} (${ns.join(', ')})`)
}
console.log(`${asignar.length} a completar, ${ambiguos.length} ambiguos${ambiguos.length ? ': ' + ambiguos.join('; ') : ''}`)

if (aplicar && asignar.length) {
  const [u] = await sql`select id from usuarios where usuario = 'fabricio'`
  await sql.begin(async (tx) => {
    for (const a of asignar) {
      const r = await tx`update presupuestos set numero_ads = ${a.ads} where id = ${a.id} and numero_ads is null returning id`
      if (r.length) await tx`insert into eventos (presupuesto_id, tipo, texto, usuario_id) values (${a.id}, 'sistema', ${`N° ADS ${a.ads}, tomado del nombre del archivo`}, ${u?.id ?? null})`
    }
  })
  console.log('aplicado')
}
await sql.end()
