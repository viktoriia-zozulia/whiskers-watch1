import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { petService } from '../services/pet.service'
import { taskService } from '../services/task.service'
import { createTaskBody } from '../schemas/task.schema'

export const taskRoutes = new Elysia()
  .use(authMiddleware)

  .get('/api/pets/:id/tasks', async ({ userId, params, status }) => {
    const pet = await petService.findOwned(Number(params.id), userId!)
    if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
    return taskService.listByPet(Number(params.id))
  })

  .post(
    '/api/pets/:id/tasks',
    async ({ userId, params, body, status }) => {
      const pet = await petService.findOwned(Number(params.id), userId!)
      if (!pet) return status(404, { error: 'Улюбленця не знайдено' })
      return taskService.create(Number(params.id), body)
    },
    { body: createTaskBody },
  )

  .patch('/api/tasks/:id/toggle', async ({ userId, params, status }) => {
    const task = await taskService.findOwned(Number(params.id), userId!)
    if (!task) return status(404, { error: 'Завдання не знайдено' })
    return taskService.setDone(task.id, !task.is_done)
  })

  .delete('/api/tasks/:id', async ({ userId, params, status }) => {
    const task = await taskService.findOwned(Number(params.id), userId!)
    if (!task) return status(404, { error: 'Завдання не знайдено' })
    await taskService.remove(task.id)
    return { ok: true }
  })
