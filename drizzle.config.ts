import { defineConfig } from 'drizzle-kit'

if (!process.env.DATABASE_URL_UNPOOLED) {
  process.loadEnvFile('.env.local')
}

// Migraciones con la conexión SIN pgbouncer: con la pooled el push falla o queda a medias.
const url = process.env.DATABASE_URL_UNPOOLED
if (!url) throw new Error('Falta DATABASE_URL_UNPOOLED. Correr: npx vercel env pull .env.local --environment=development')

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url },
})
