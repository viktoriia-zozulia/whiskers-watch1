import nodemailer from 'nodemailer'
import { db } from '../db'
import { config, isSmtpEnabled } from '../config/env'

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long' })
}

export const notificationService = {
  /** Builds a weekly health digest (HTML + plain text) for a user's pets. */
  async buildDigest(userId: number) {
    const user = await db
      .selectFrom('users').where('id', '=', userId)
      .select(['email', 'name']).executeTakeFirst()
    if (!user) return null

    const pets = await db
      .selectFrom('pets').where('user_id', '=', userId).selectAll().execute()

    const now = new Date()
    const weekAhead = new Date(now.getTime() + 7 * 864e5)
    const sections: string[] = []
    const textLines: string[] = [`Привіт, ${user.name || 'друже'}! Ось тижневий звіт WhiskersWatch.`, '']

    for (const pet of pets) {
      const upcoming = await db
        .selectFrom('tasks')
        .where('pet_id', '=', pet.id)
        .where('is_done', '=', false)
        .where('task_time', '<=', weekAhead)
        .orderBy('task_time', 'asc')
        .selectAll().execute()

      const lastWeight = await db
        .selectFrom('measurements')
        .where('pet_id', '=', pet.id)
        .orderBy('date_measured', 'desc')
        .select(['weight_kg', 'date_measured']).executeTakeFirst()

      const recentRecords = await db
        .selectFrom('medical_records')
        .where('pet_id', '=', pet.id)
        .where('record_date', '>=', new Date(now.getTime() - 7 * 864e5))
        .orderBy('record_date', 'desc')
        .select(['record_type', 'text', 'record_date']).execute()

      const taskHtml = upcoming.length
        ? `<ul>${upcoming.map(t => `<li>${fmtDate(t.task_time)} — <b>${t.title}</b> (${t.type})</li>`).join('')}</ul>`
        : '<p style="color:#888">Немає запланованих завдань 🎉</p>'

      sections.push(`
        <div style="margin:20px 0;padding:16px;border:1px solid #e2e8f0;border-radius:14px">
          <h3 style="margin:0 0 8px">🐾 ${pet.name} <span style="color:#888;font-weight:normal">(${pet.species})</span></h3>
          ${lastWeight ? `<p style="margin:4px 0">Вага: <b>${lastWeight.weight_kg} кг</b> (${fmtDate(lastWeight.date_measured)})</p>` : ''}
          <p style="margin:8px 0 4px;font-weight:600">Завдання на тиждень:</p>
          ${taskHtml}
          ${recentRecords.length ? `<p style="margin:8px 0 4px;font-weight:600">Останні записи:</p><ul>${recentRecords.map(r => `<li>${r.record_type}: ${r.text || '—'}</li>`).join('')}</ul>` : ''}
        </div>`)

      textLines.push(`🐾 ${pet.name} (${pet.species})`)
      if (lastWeight) textLines.push(`  Вага: ${lastWeight.weight_kg} кг`)
      textLines.push(`  Завдань на тиждень: ${upcoming.length}`)
      textLines.push('')
    }

    const html = `
      <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;color:#1e293b">
        <h2 style="color:#0d9488">WhiskersWatch — тижневий звіт</h2>
        <p>Привіт, ${user.name || 'друже'}! Ось що відбувається зі здоров'ям ваших улюбленців.</p>
        ${pets.length ? sections.join('') : '<p>У вас ще немає улюбленців.</p>'}
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">Ви отримали цей лист, бо увімкнули email-розсилку в налаштуваннях WhiskersWatch.</p>
      </div>`

    return { to: user.email, subject: '🐾 Тижневий звіт здоров\'я — WhiskersWatch', html, text: textLines.join('\n') }
  },

  /** Sends the digest via SMTP. Throws a clear error if SMTP isn't configured. */
  async sendDigest(userId: number) {
    if (!isSmtpEnabled()) {
      throw new Error('SMTP не налаштовано на сервері. Додайте SMTP_HOST/SMTP_USER/SMTP_PASS у backend/.env')
    }
    const digest = await this.buildDigest(userId)
    if (!digest) throw new Error('Користувача не знайдено')
    if (!digest.to) throw new Error('У акаунта немає email-адреси (вхід через Google без пошти)')

    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.pass },
    })

    await transporter.sendMail({
      from: config.smtp.from,
      to: digest.to,
      subject: digest.subject,
      html: digest.html,
      text: digest.text,
    })
    return { sent: true, to: digest.to }
  },
}
