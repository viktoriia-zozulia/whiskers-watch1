import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { petService } from '../services/pet.service'
import { createPetBody, updatePetBody } from '../schemas/pet.schema'

export const petRoutes = new Elysia({ prefix: '/api/pets' })
  .use(authMiddleware)

  .get('/', ({ userId }) => petService.listByUser(userId!))

  .post('/', ({ userId, body }) => petService.create(userId!, body), { body: createPetBody })

  .get('/:id', async ({ userId, params, status }) => {
    const pet = await petService.findOwned(Number(params.id), userId!)
    if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
    return pet
  })

  .put(
    '/:id',
    async ({ userId, params, body, status }) => {
      const pet = await petService.findOwned(Number(params.id), userId!)
      if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
      return petService.update(Number(params.id), {
        name: body.name ?? pet.name,
        species: body.species ?? pet.species,
        breed: body.breed !== undefined ? body.breed : pet.breed,
        birth_date: body.birth_date !== undefined ? body.birth_date : pet.birth_date,
        weight: body.weight !== undefined ? body.weight : pet.weight,
        allergies: body.allergies !== undefined ? body.allergies : pet.allergies,
        photo_url: body.photo_url !== undefined ? body.photo_url : pet.photo_url,
      })
    },
    { body: updatePetBody },
  )

  .delete('/:id', async ({ userId, params, status }) => {
    const pet = await petService.findOwned(Number(params.id), userId!)
    if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
    await petService.remove(Number(params.id))
    return { ok: true }
  })
