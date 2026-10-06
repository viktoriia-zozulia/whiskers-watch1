import { req } from '../client'
import type { CreateTaskDto, Task } from './task.models'

export const tasksApi = {
  list: (petId: number) => req<Task[]>('GET', `/api/pets/${petId}/tasks`),
  create: (petId: number, data: CreateTaskDto) => req<Task>('POST', `/api/pets/${petId}/tasks`, data),
  toggle: (id: number) => req<Task>('PATCH', `/api/tasks/${id}/toggle`),
  delete: (id: number) => req<{ ok: boolean }>('DELETE', `/api/tasks/${id}`),
}
