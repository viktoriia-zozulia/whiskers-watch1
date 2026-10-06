export interface Task {
  id: number
  pet_id: number
  title: string
  type: string
  task_time: string
  is_done: boolean
}

export interface CreateTaskDto {
  title: string
  type: string
  task_time: string
}
