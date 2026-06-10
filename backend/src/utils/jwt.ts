import { config } from '../config/env'

function toB64Url(data: ArrayBuffer | string): string {
  const base64 =
    typeof data === 'string'
      ? btoa(data)
      : btoa(String.fromCharCode(...new Uint8Array(data)))
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function fromB64Url(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  return atob(str)
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(config.jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

export async function signToken(payload: Record<string, unknown>): Promise<string> {
  const header = toB64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = toB64Url(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + config.jwtExpiresIn,
    }),
  )
  const key = await getKey()
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(`${header}.${body}`),
  )
  return `${header}.${body}.${toB64Url(sig)}`
}

export async function verifyToken(token: string): Promise<{ userId: number } | null> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [header, body, sig] = parts as [string, string, string]
    const key = await getKey()
    const sigBytes = Uint8Array.from(fromB64Url(sig), (c) => c.charCodeAt(0))
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      new TextEncoder().encode(`${header}.${body}`),
    )
    if (!valid) return null
    const payload = JSON.parse(fromB64Url(body)) as { userId: number; exp: number }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
