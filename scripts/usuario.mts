/**
 * Crea un usuario o le resetea la contraseña.
 *   npm run usuario -- <usuario> "<Nombre completo>"
 * La contraseña se genera al azar y se guarda en .credenciales/<usuario>.txt
 * (ignorado por git) para no mostrarla en la terminal ni en logs.
 */
import { randomBytes } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import postgres from 'postgres'
import { hashPassword } from '../src/lib/auth/hash'

process.loadEnvFile('.env.local')

const [usuario, nombre] = process.argv.slice(2)
if (!usuario || !nombre) {
  console.error('Uso: npm run usuario -- <usuario> "<Nombre completo>"')
  process.exit(1)
}

const alfabeto = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const password = Array.from(randomBytes(14), (b) => alfabeto[b % alfabeto.length]).join('')

const sql = postgres(process.env.DATABASE_URL_UNPOOLED!, { prepare: false })
const hash = await hashPassword(password)
await sql`
  insert into usuarios (nombre, usuario, password_hash)
  values (${nombre}, ${usuario.toLowerCase()}, ${hash})
  on conflict (usuario) do update set nombre = excluded.nombre, password_hash = excluded.password_hash, activo = true
`
await sql.end()

mkdirSync('.credenciales', { recursive: true })
writeFileSync(`.credenciales/${usuario.toLowerCase()}.txt`, `Usuario: ${usuario.toLowerCase()}\nContraseña: ${password}\n`, { mode: 0o600 })
console.log(`Usuario "${usuario.toLowerCase()}" listo. Credenciales en .credenciales/${usuario.toLowerCase()}.txt`)
