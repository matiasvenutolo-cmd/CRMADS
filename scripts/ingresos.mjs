/**
 * Quién entra al CRM y con qué frecuencia (sólo lectura).
 *   node scripts/ingresos.mjs [días]      por defecto, los últimos 30 días
 */
import postgres from 'postgres'

if (!process.env.DATABASE_URL_UNPOOLED) process.loadEnvFile('.env.local')
const dias = Number(process.argv[2]) || 30
const sql = postgres(process.env.DATABASE_URL_UNPOOLED, { prepare: false, max: 1 })
const TZ = 'America/Argentina/Buenos_Aires'
await sql.begin('read only', async (tx) => {
  const filas = await tx`
    select u.nombre, u.rol,
      to_char(u.ultimo_ingreso at time zone ${TZ}, 'DD/MM HH24:MI') as ultimo,
      count(i.id)::int as ingresos,
      count(distinct (i.created_at at time zone ${TZ})::date)::int as dias_con_ingreso
    from usuarios u
    left join ingresos i on i.usuario_id = u.id and i.created_at > now() - make_interval(days => ${dias})
    where u.activo
    group by u.id
    order by u.ultimo_ingreso desc nulls last`
  console.log(`Ingresos de los últimos ${dias} días`)
  console.table(filas.map((f) => ({ usuario: f.nombre, rol: f.rol, 'último ingreso': f.ultimo ?? '—', ingresos: f.ingresos, 'días con ingreso': f.dias_con_ingreso })))
})
await sql.end()
