import { Elysia } from 'elysia'
import { authMiddleware } from '../middlewares/auth'
import { uploadService } from '../services/upload.service'
import { uploadBody } from '../schemas/upload.schema'

export const uploadRoutes = new Elysia()
  // Public: images are loaded via <img src> (no Authorization header). Names
  // are random UUIDs, so they can't be guessed.
  .get('/api/uploads/:name', async ({ params, status }) => {
    const image = await uploadService.read(params.name)
    if (!image) return status(404, { error: 'Файл не знайдено' })
    return new Response(image.body, {
      headers: {
        'Content-Type': image.mime.startsWith('image/') ? image.mime : 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  })

  // Protected: upload a new image, returns its public URL
  .use(authMiddleware)
  .post('/api/upload', async ({ userId, body }) => ({ url: await uploadService.save(userId!, body.file) }), {
    body: uploadBody,
  })
