import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { petService } from '../services/pet.service'
import { measurementService } from '../services/measurement.service'
import { createMeasurementBody } from '../schemas/measurement.schema'

export const measurementRoutes = new Elysia()
  .use(authMiddleware)

  .get('/api/pets/:id/measurements', async ({ userId, params, status }) => {
    const pet = await petService.findOwned(Number(params.id), userId!)
    if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
    return measurementService.listByPet(Number(params.id))
  })

  .post(
    '/api/pets/:id/measurements',
    async ({ userId, params, body, status }) => {
      const pet = await petService.findOwned(Number(params.id), userId!)
      if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
      return measurementService.create(Number(params.id), body)
    },
    { body: createMeasurementBody },
  )
