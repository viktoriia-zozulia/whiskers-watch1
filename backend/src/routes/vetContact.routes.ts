import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { vetContactService } from '../services/vetContact.service'
import { createVetContactBody, updateVetContactBody } from '../schemas/vetContact.schema'

export const vetContactRoutes = new Elysia({ prefix: '/api/vet-contacts' })
  .use(authMiddleware)

  .get('/', ({ userId }) => vetContactService.listByUser(userId!))

  .post('/', ({ userId, body }) => vetContactService.create(userId!, body), {
    body: createVetContactBody,
  })

  .put(
    '/:id',
    async ({ userId, params, body, status }) => {
      const contact = await vetContactService.findOwned(Number(params.id), userId!)
      if (!contact) return status(404, { error: 'Контакт не знайдено' })
      return vetContactService.update(Number(params.id), {
        doc_name: body.doc_name !== undefined ? body.doc_name : contact.doc_name,
        clinic: body.clinic ?? contact.clinic,
        phone: body.phone !== undefined ? body.phone : contact.phone,
      })
    },
    { body: updateVetContactBody },
  )

  .delete('/:id', async ({ userId, params, status }) => {
    const contact = await vetContactService.findOwned(Number(params.id), userId!)
    if (!contact) return status(404, { error: 'Контакт не знайдено' })
    await vetContactService.remove(Number(params.id))
    return { ok: true }
  })
