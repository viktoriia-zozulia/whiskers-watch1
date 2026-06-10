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
} as const
