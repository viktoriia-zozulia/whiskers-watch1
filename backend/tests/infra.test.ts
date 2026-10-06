import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRateLimiter } from '../src/utils/rateLimit'
import { staticSite } from '../src/middlewares/staticSite'

describe('rate limiter', () => {
  test('allows `max` hits per window, then blocks', () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60_000 })
    expect([1, 2, 3, 4].map(() => limiter.hit('ip'))).toEqual([true, true, true, false])
    expect(limiter.hit('other-ip')).toBe(true)
  })

  test('the window resets', async () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 20 })
    expect(limiter.hit('ip')).toBe(true)
    expect(limiter.hit('ip')).toBe(false)
    await Bun.sleep(30)
    expect(limiter.hit('ip')).toBe(true)
  })
})

describe('static site', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'ww-static-'))
  await writeFile(path.join(dir, 'index.html'), '<!doctype html><title>app</title>')
  await writeFile(path.join(dir, 'chunk-abcd1234.js'), 'console.log(1)')
  const app = staticSite(dir)
  const get = (url: string) => app.handle(new Request(`http://localhost${url}`))
  afterAll(() => rm(dir, { recursive: true, force: true }))

  test('serves fingerprinted assets with a long cache', async () => {
    const res = await get('/chunk-abcd1234.js')
    expect(await res.text()).toBe('console.log(1)')
    expect(res.headers.get('cache-control')).toContain('immutable')
  })

  test('falls back to index.html for unknown paths', async () => {
    const res = await get('/some/deep/link')
    expect(await res.text()).toContain('<title>app</title>')
    expect(res.headers.get('cache-control')).toBe('no-cache')
  })

  test('never serves files outside the build directory', async () => {
    const res = await get('/..%2F..%2F..%2Fetc%2Fpasswd')
    expect(await res.text()).toContain('<title>app</title>')
  })

  test('unknown API paths stay JSON 404s', async () => {
    expect((await get('/api/nope')).status).toBe(404)
  })
})
