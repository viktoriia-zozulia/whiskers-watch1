import { Elysia } from 'elysia'
import { authRoutes } from './auth.routes'
import { uploadRoutes } from './upload.routes'
import { petRoutes } from './pet.routes'
import { taskRoutes } from './task.routes'
import { recordRoutes } from './record.routes'
import { measurementRoutes } from './measurement.routes'
import { vetContactRoutes } from './vetContact.routes'
import { settingsRoutes } from './settings.routes'

/** Mounts every entity's controller under a single plugin. */
export const routes = new Elysia()
  .use(authRoutes)
  .use(uploadRoutes)
  .use(petRoutes)
  .use(taskRoutes)
  .use(recordRoutes)
  .use(measurementRoutes)
  .use(vetContactRoutes)
  .use(settingsRoutes)
