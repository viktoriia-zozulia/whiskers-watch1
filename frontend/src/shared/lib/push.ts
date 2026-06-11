// Thin wrapper around the browser Notification API.

const ICON = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🐾</text></svg>"

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export function getPermission(): NotificationPermission {
  return isPushSupported() ? Notification.permission : 'denied'
}

// Must be called from a user gesture (e.g. a click) per browser policy.
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return 'denied'
  return Notification.requestPermission()
}

export function showNotification(title: string, body: string) {
  if (getPermission() !== 'granted') return
  try {
    new Notification(title, { body, icon: ICON })
  } catch {
    // Some browsers require notifications to come from a service worker; ignore.
  }
}
