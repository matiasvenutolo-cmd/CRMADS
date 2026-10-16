import 'server-only'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

declare global {
  var __adsSql: ReturnType<typeof postgres> | undefined
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Falta DATABASE_URL. Correr: npx vercel env pull .env.local --environment=development')
}

const client = globalThis.__adsSql ?? postgres(connectionString, { prepare: false })
if (process.env.NODE_ENV !== 'production') globalThis.__adsSql = client

export const db = drizzle(client, { schema })
