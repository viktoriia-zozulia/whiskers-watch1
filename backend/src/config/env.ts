/**
 * Centralized environment configuration.
 * All values are read once from `.env` and exposed through a typed object.
 */
export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 3001,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'whiskers-watch-secret-2026',
  jwtExpiresIn: 7 * 24 * 60 * 60, // seconds (7 days)
  uploadsDir: 'uploads',
  maxUploadSize: '5m',

  // Google OAuth — set GOOGLE_CLIENT_ID in .env to enable "Sign in with Google".
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',

  // SMTP for email digests — set these in .env to enable real sending.
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? process.env.SMTP_USER ?? 'WhiskersWatch <no-reply@whiskerswatch.app>',
  },
} as const

export const isGoogleEnabled = () => config.googleClientId !== ''
export const isSmtpEnabled = () => config.smtp.host !== '' && config.smtp.user !== ''
