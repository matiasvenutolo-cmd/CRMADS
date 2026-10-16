import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

// scrypt nativo de Node: evita el binding nativo de bcrypt en el build de Vercel.
const scryptAsync = promisify(scrypt)
const KEY_LEN = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, KEY_LEN)) as Buffer
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) return false
  const expected = Buffer.from(hashHex, 'hex')
  const derived = (await scryptAsync(password, Buffer.from(saltHex, 'hex'), KEY_LEN)) as Buffer
  return derived.length === expected.length && timingSafeEqual(derived, expected)
}
