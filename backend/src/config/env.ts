/**
 * Centralized environment configuration.
 * All values are read once from `.env` and exposed through a typed object.
 */

// Read an env var, trimming surrounding whitespace (a stray space after `=`
// in .env is an easy mistake that otherwise breaks hostnames/keys silently).
const env = (key: string, fallback = '') => (process.env[key] ?? fallback).trim()

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'whiskers-watch-secret-2026',
  jwtExpiresIn: 7 * 24 * 60 * 60, // seconds (7 days)
  uploadsDir: 'uploads',
  maxUploadSize: '5m',

  // Google OAuth — set GOOGLE_CLIENT_ID in .env to enable "Sign in with Google".
  googleClientId: env('GOOGLE_CLIENT_ID'),

  // SMTP for email digests — set these in .env to enable real sending.
  smtp: {
    host: env('SMTP_HOST'),
    port: process.env.SMTP_PORT ? Number(env('SMTP_PORT')) : 587,
    user: env('SMTP_USER'),
    pass: process.env.SMTP_PASS ?? '', // password may legitimately contain spaces
    from: env('SMTP_FROM') || env('SMTP_USER') || 'WhiskersWatch <no-reply@whiskerswatch.app>',
  },
} as const

export const isGoogleEnabled = () => config.googleClientId !== ''
export const isSmtpEnabled = () => config.smtp.host !== '' && config.smtp.user !== ''
