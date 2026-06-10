import { db } from '../db'

export const taskService = {
  listByPet(petId: number) {
    return db
      .selectFrom('tasks')
      .where('pet_id', '=', petId)
      .selectAll()
      .orderBy('task_time', 'asc')
      .execute()
  },

  create(petId: number, data: { title: string; type: string; task_time: string }) {
    return db
      .insertInto('tasks')
      .values({
        pet_id: petId,
        title: data.title,
        type: data.type,
        task_time: new Date(data.task_time),
        is_done: false,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  /** Returns the task (id + is_done) only if it belongs to the user. */
  findOwned(taskId: number, userId: number) {
    return db
      .selectFrom('tasks')
      .innerJoin('pets', 'pets.id', 'tasks.pet_id')
      .where('tasks.id', '=', taskId)
      .where('pets.user_id', '=', userId)
      .select(['tasks.id', 'tasks.is_done'])
      .executeTakeFirst()
  },

  setDone(taskId: number, isDone: boolean) {
    return db
      .updateTable('tasks')
      .set({ is_done: isDone })
      .where('id', '=', taskId)
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  remove(taskId: number) {
    return db.deleteFrom('tasks').where('id', '=', taskId).execute()
  },
}
