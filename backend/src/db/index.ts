import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { config } from '../config/env'
import type { Database } from './types'

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: config.databaseUrl,
    max: 10,
  }),
})

/** Shared, fully-typed Kysely connection used by every service. */
export const db = new Kysely<Database>({ dialect })

export type { Database } from './types'
