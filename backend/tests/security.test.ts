import { describe, expect, test } from 'bun:test'
import { signToken, verifyToken } from '../src/utils/jwt'
import { extensionFor, sanitizeUploadName } from '../src/services/upload.service'
import { escapeHtml } from '../src/services/notification.service'
import { normalizeEmail } from '../src/services/auth.service'

describe('jwt', () => {
  test('round-trips a payload', async () => {
    const token = await signToken({ userId: 42 })
    expect(await verifyToken(token)).toEqual({ userId: 42 })
  })

  test('rejects a tampered payload', async () => {
    const [h, , s] = (await signToken({ userId: 1 })).split('.')
    const forged = btoa(JSON.stringify({ userId: 999, exp: 9999999999 })).replace(/=/g, '')
    expect(await verifyToken(`${h}.${forged}.${s}`)).toBeNull()
  })

  test('rejects garbage', async () => {
    expect(await verifyToken('not-a-jwt')).toBeNull()
    expect(await verifyToken('a.b.c')).toBeNull()
  })
})

describe('uploads', () => {
  test('extension comes from the MIME type, never from the filename', () => {
    expect(extensionFor('image/png')).toBe('png')
    expect(extensionFor('image/jpeg')).toBe('jpg')
    expect(extensionFor('IMAGE/WEBP')).toBe('webp')
    expect(extensionFor('text/html')).toBeNull()
    expect(extensionFor('image/svg+xml')).toBeNull() // SVG can carry scripts
  })

  test('file names cannot escape the uploads directory', () => {
    expect(sanitizeUploadName('../../etc/passwd')).toBe('etcpasswd')
    expect(sanitizeUploadName('..')).toBe('')
    expect(sanitizeUploadName('abc-123.jpg')).toBe('abc-123.jpg')
  })
})

describe('email digest', () => {
  test('escapes user-controlled HTML', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe('&lt;img src=x onerror=alert(1)&gt;')
    expect(escapeHtml(`"Барсик" & 'Мурка'`)).toBe('&quot;Барсик&quot; &amp; &#39;Мурка&#39;')
    expect(escapeHtml(null)).toBe('')
  })
})

describe('auth', () => {
  test('emails are normalised for lookup', () => {
    expect(normalizeEmail('  Vika@Mail.COM ')).toBe('vika@mail.com')
  })
})
