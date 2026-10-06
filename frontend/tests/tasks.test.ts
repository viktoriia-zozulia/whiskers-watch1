import { describe, expect, test } from 'bun:test'
import type { Task } from '../src/api'
import { careStreak, isOverdue, selectTodayTasks } from '../src/shared/lib/tasks'

const now = new Date(2026, 9, 5, 15, 0)
let id = 0
function task(daysFromNow: number, hour: number, is_done: boolean): Task {
  const d = new Date(now)
  d.setDate(d.getDate() + daysFromNow)
  d.setHours(hour, 0, 0, 0)
  return { id: ++id, pet_id: 1, title: `t${id}`, type: 'Ліки', task_time: d.toISOString(), is_done }
}

describe('selectTodayTasks', () => {
  test("shows today's tasks and pending overdue ones, but not old completed ones", () => {
    const today = task(0, 9, true)
    const overdue = task(-2, 9, false)
    const oldDone = task(-2, 10, true)
    const tomorrow = task(1, 9, false)
    const result = selectTodayTasks([tomorrow, oldDone, today, overdue], now)
    expect(result.map(t => t.id)).toEqual([overdue.id, today.id])
  })
})

describe('isOverdue', () => {
  test('only tasks from previous days that are still pending', () => {
    expect(isOverdue(task(-1, 9, false), now)).toBe(true)
    expect(isOverdue(task(-1, 9, true), now)).toBe(false)
    expect(isOverdue(task(0, 9, false), now)).toBe(false) // earlier today: still "today"
  })
})

describe('careStreak', () => {
  test('counts consecutive fully-completed days', () => {
    const tasks = [task(-1, 9, true), task(-2, 9, true), task(-2, 19, true), task(-3, 9, true)]
    expect(careStreak(tasks, now)).toBe(3)
  })

  test('an unfinished today does not break the streak, a finished one extends it', () => {
    const past = [task(-1, 9, true), task(-2, 9, true)]
    expect(careStreak([...past, task(0, 20, false)], now)).toBe(2)
    expect(careStreak([...past, task(0, 9, true)], now)).toBe(3)
  })

  test('a missed task or an empty day ends the streak', () => {
    expect(careStreak([task(-1, 9, true), task(-2, 9, false), task(-3, 9, true)], now)).toBe(1)
    expect(careStreak([task(-1, 9, true), task(-3, 9, true)], now)).toBe(1)
    expect(careStreak([], now)).toBe(0)
  })
})
