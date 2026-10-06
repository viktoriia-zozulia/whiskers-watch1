import type { Task } from '../../api'
import { isSameDay } from './format'

/**
 * "Today" view: everything scheduled for today (done or not) plus anything
 * overdue that is still pending. Old completed tasks don't pile up here.
 */
export function selectTodayTasks(tasks: Task[], now = new Date()): Task[] {
  return tasks
    .filter(t => {
      const d = new Date(t.task_time)
      return isSameDay(d, now) || (d < now && !t.is_done)
    })
    .sort((a, b) => a.task_time.localeCompare(b.task_time))
}

export function isOverdue(task: Task, now = new Date()) {
  const d = new Date(task.task_time)
  return !task.is_done && d < now && !isSameDay(d, now)
}

/**
 * Care streak: consecutive days (ending today or yesterday) on which every
 * scheduled task was completed. Today only counts once it's fully done, so
 * an in-progress day never breaks the streak.
 */
export function careStreak(tasks: Task[], now = new Date()): number {
  const byDay = new Map<string, Task[]>()
  for (const t of tasks) {
    const key = new Date(t.task_time).toDateString()
    byDay.set(key, [...(byDay.get(key) ?? []), t])
  }
  const complete = (day: Date) => {
    const list = byDay.get(day.toDateString())
    return !!list && list.length > 0 && list.every(t => t.is_done)
  }

  const cursor = new Date(now)
  let streak = 0
  if (complete(cursor)) streak++
  cursor.setDate(cursor.getDate() - 1)
  while (complete(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
