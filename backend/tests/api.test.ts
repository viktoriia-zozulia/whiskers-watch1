/**
 * Integration tests against a running API. Skipped unless API_URL is set:
 *   API_URL=http://localhost:3001 bun test
 */
import { describe, expect, test } from 'bun:test'

const API = process.env.API_URL
const d = API ? describe : describe.skip

async function call(path: string, init: RequestInit & { token?: string } = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
  })
  return { status: res.status, body: await res.json().catch(() => null) as any }
}

d('API', () => {
  test('protected routes require a token', async () => {
    expect((await call('/api/pets')).status).toBe(401)
  })

  test('demo sandbox: isolated account with seeded data', async () => {
    const demo = await call('/api/auth/demo', { method: 'POST' })
    expect(demo.status).toBe(200)
    const token = demo.body.token as string

    const me = await call('/api/auth/me', { token })
    expect(me.body.is_demo).toBe(true)

    const pets = await call('/api/pets', { token })
    expect(pets.body.map((p: any) => p.name)).toEqual(['Сніжок', 'Рекс'])

    // A second visitor gets a separate account and cannot read the first one's pets
    const other = (await call('/api/auth/demo', { method: 'POST' })).body.token as string
    expect((await call(`/api/pets/${pets.body[0].id}`, { token: other })).status).toBe(404)
  })

  test('invalid ids are rejected with 422, not a 500', async () => {
    const token = (await call('/api/auth/demo', { method: 'POST' })).body.token
    expect((await call('/api/pets/abc', { token })).status).toBe(422)
  })

  test('back-filling an old weigh-in keeps the current weight', async () => {
    const token = (await call('/api/auth/demo', { method: 'POST' })).body.token
    const [pet] = (await call('/api/pets', { token })).body
    await call(`/api/pets/${pet.id}/measurements`, {
      method: 'POST', token, body: JSON.stringify({ date_measured: '2020-01-01', weight_kg: 2 }),
    })
    expect((await call(`/api/pets/${pet.id}`, { token })).body.weight).toBe(pet.weight)
  })
})
