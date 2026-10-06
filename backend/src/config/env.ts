/**
 * Centralized environment configuration.
 * All values are read once from `.env` and exposed through a typed object.
 */

// Read an env var, trimming surrounding whitespace (a stray space after `=`
// in .env is an easy mistake that otherwise breaks hostnames/keys silently).
const env = (key: string, fallback = '') => (process.env[key] ?? fallback).trim()

const DEV_JWT_SECRET = 'whiskers-watch-secret-2026'

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  jwtExpiresIn: 7 * 24 * 60 * 60, // seconds (7 days)
  uploadsDir: 'uploads', // legacy on-disk images; new uploads are stored in Postgres

  // Production: serve the built frontend from this directory (e.g. ../frontend/dist).
  staticDir: env('STATIC_DIR'),
  // Comma-separated origins allowed to call the API cross-origin. Not needed
  // when the frontend is served by this process or through the dev proxy.
  corsOrigins: env('CORS_ORIGIN').split(',').map(s => s.trim()).filter(Boolean),
  // Behind a hosting proxy (Render, Koyeb, …) trust X-Forwarded-For for client IPs.
  trustProxy: env('TRUST_PROXY') === 'true',
  maxUploadSize: '5m',

  // One-click demo accounts (sandboxed per visitor). Set DEMO_ENABLED=false to disable.
  demoEnabled: env('DEMO_ENABLED', 'true') !== 'false',
  demoTtlHours: 24,

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

// The dev secret is public (it's in the repo): anyone could forge login tokens.
if (config.jwtSecret === DEV_JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET must be set in production.')
}
