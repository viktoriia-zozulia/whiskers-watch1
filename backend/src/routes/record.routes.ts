import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { idParams } from '../schemas/common.schema'
import { petService } from '../services/pet.service'
import { recordService } from '../services/record.service'
import { createRecordBody, listRecordsQuery } from '../schemas/record.schema'

export const recordRoutes = new Elysia()
  .use(authMiddleware)

  .get(
    '/api/pets/:id/records',
    async ({ userId, params, query, status }) => {
      const pet = await petService.findOwned(Number(params.id), userId!)
      if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
      return recordService.listByPet(Number(params.id), { type: query.type, search: query.search })
    },
    { ...idParams, query: listRecordsQuery },
  )

  .post(
    '/api/pets/:id/records',
    async ({ userId, params, body, status }) => {
      const pet = await petService.findOwned(Number(params.id), userId!)
      if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
      return recordService.create(Number(params.id), body)
    },
    { ...idParams, body: createRecordBody },
  )

  .delete('/api/records/:id', async ({ userId, params, status }) => {
    const record = await recordService.findOwned(Number(params.id), userId!)
    if (!record) return status(404, { error: 'Запис не знайдено' })
    await recordService.remove(record.id)
    return { ok: true }
  }, idParams)
