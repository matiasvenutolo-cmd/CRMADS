// Montos en letras para el presupuesto: 39800 → «Treinta y nueve mil ochocientos con 00/100».

const UNI = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte', 'veintiún', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve']
const DEC = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']
const CEN = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos']

function hasta999(n: number): string {
  if (n === 0) return ''
  if (n === 100) return 'cien'
  const c = Math.floor(n / 100)
  const r = n % 100
  const resto = r < 30 ? UNI[r] : `${DEC[Math.floor(r / 10)]}${r % 10 ? ` y ${UNI[r % 10]}` : ''}`
  return [CEN[c], resto].filter(Boolean).join(' ')
}

function entero(n: number): string {
  if (n === 0) return 'cero'
  const millones = Math.floor(n / 1_000_000)
  const miles = Math.floor((n % 1_000_000) / 1000)
  const resto = n % 1000
  const partes = []
  if (millones) partes.push(millones === 1 ? 'un millón' : `${entero(millones)} millones`)
  if (miles) partes.push(miles === 1 ? 'mil' : `${hasta999(miles)} mil`)
  if (resto) partes.push(hasta999(resto))
  return partes.join(' ')
}

export function montoEnLetras(monto: number) {
  const total = Math.round(monto * 100)
  const t = `${entero(Math.floor(total / 100))} con ${String(total % 100).padStart(2, '0')}/100`
  return t.charAt(0).toUpperCase() + t.slice(1)
}
