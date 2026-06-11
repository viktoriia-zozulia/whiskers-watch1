import { useEffect, useState } from 'react'
import { Bell, BellRing, Loader2, Mail, Send } from 'lucide-react'
import { notificationsApi } from '../../http_client'
import { usePet } from '../../hooks/usePet'
import { run, toast } from '../../shared/lib/toast'
import {
  getPermission, isPushSupported, requestNotificationPermission, showNotification,
} from '../../shared/lib/push'

export function NotificationSettings() {
  const { settings, toggleSetting } = usePet()
  const [perm, setPerm] = useState(getPermission())
  const [emailConfigured, setEmailConfigured] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    notificationsApi.status().then(s => setEmailConfigured(s.emailConfigured)).catch(() => {})
  }, [])

  async function togglePush() {
    const turningOn = !settings?.push_enabled
    if (turningOn && isPushSupported() && getPermission() === 'default') {
      const result = await requestNotificationPermission()
      setPerm(result)
      if (result !== 'granted') {
        toast('Дозвіл на сповіщення не надано браузером', 'info')
      }
    }
    await toggleSetting('push_enabled')
  }

  function testPush() {
    if (getPermission() !== 'granted') {
      toast('Спершу увімкніть push та надайте дозвіл', 'info')
      return
    }
    showNotification('🐾 WhiskersWatch', 'Так виглядатимуть ваші нагадування про завдання!')
  }

  async function sendDigest() {
    setSending(true)
    const res = await run(() => notificationsApi.sendDigest())
    setSending(false)
    if (res?.sent) toast(`Лист надіслано на ${res.to}`, 'success')
  }

  const pushOn = settings?.push_enabled ?? false
  const emailOn = settings?.email_enabled ?? false

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell size={20} className="text-teal-600" /> Сповіщення</h2>

      <div className="space-y-4">
        {/* Push */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Push-сповіщення</p>
              <p className="text-sm text-slate-500">Нагадування про завдання прямо у браузері</p>
            </div>
            <button onClick={togglePush}
              className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${pushOn ? 'bg-teal-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${pushOn ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          {pushOn && (
            <div className="mt-3 flex items-center gap-3">
              <button onClick={testPush}
                className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1">
                <BellRing size={15} /> Тестове сповіщення
              </button>
              {!isPushSupported() && <span className="text-xs text-amber-600">Браузер не підтримує сповіщення</span>}
              {isPushSupported() && perm === 'denied' && <span className="text-xs text-amber-600">Дозвіл заблоковано в браузері</span>}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-800">Email-розсилка</p>
              <p className="text-sm text-slate-500">Щотижневий звіт про здоров'я улюбленців</p>
            </div>
            <button onClick={() => toggleSetting('email_enabled')}
              className={`w-12 h-6 rounded-full relative transition-colors shrink-0 ${emailOn ? 'bg-teal-500' : 'bg-slate-300'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${emailOn ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
          {emailOn && (
            <div className="mt-3 flex items-center gap-3">
              <button onClick={sendDigest} disabled={sending || !emailConfigured}
                className="text-teal-600 text-sm font-medium hover:underline flex items-center gap-1 disabled:text-slate-300 disabled:no-underline">
                {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Надіслати звіт зараз
              </button>
              {!emailConfigured && (
                <span className="text-xs text-amber-600 flex items-center gap-1">
                  <Mail size={12} /> SMTP не налаштовано на сервері
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
