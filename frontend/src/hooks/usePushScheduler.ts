import { useEffect } from 'react'
import { usePet } from './usePet'
import { getPermission, isPushSupported, showNotification } from '../shared/lib/push'

// Schedules browser notifications for upcoming pending tasks (within the next
// 24h) whenever push is enabled and permission has been granted. Re-runs when
// tasks or the push preference change; clears pending timers on cleanup.
export function usePushScheduler() {
  const { tasks, settings } = usePet()
  const pushEnabled = settings?.push_enabled ?? false

  useEffect(() => {
    if (!isPushSupported() || getPermission() !== 'granted' || !pushEnabled) return

    const now = Date.now()
    const timers: ReturnType<typeof setTimeout>[] = []
    for (const t of tasks) {
      if (t.is_done) continue
      const delay = new Date(t.task_time).getTime() - now
      if (delay > 0 && delay < 24 * 3600 * 1000) {
        timers.push(setTimeout(
          () => showNotification('🐾 WhiskersWatch', `Час виконати: ${t.title}`),
          delay,
        ))
      }
    }
    return () => timers.forEach(clearTimeout)
  }, [tasks, pushEnabled])
}
