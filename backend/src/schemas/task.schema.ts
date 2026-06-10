import { t } from 'elysia'

export const createTaskBody = t.Object({
  title: t.String({ minLength: 1 }),
  type: t.String({ minLength: 1 }),
  task_time: t.String(),
})
