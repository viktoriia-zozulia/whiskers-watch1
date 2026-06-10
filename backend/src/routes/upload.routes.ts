import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { uploadService } from '../services/upload.service'
import { uploadBody } from '../schemas/upload.schema'

export const uploadRoutes = new Elysia()
  // Public: images are loaded via <img src> (no Authorization header)
  .get('/api/uploads/:name', async ({ params, status }) => {
    const file = await uploadService.read(params.name)
    if (!file) return status(404, { error: 'Файл не знайдено' })
    return new Response(file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
    })
  })

  // Protected: upload a new image, returns its public URL
  .use(authMiddleware)
  .post('/api/upload', async ({ body }) => ({ url: await uploadService.save(body.file) }), {
    body: uploadBody,
  })
