import { Kysely, PostgresDialect } from 'kysely'
import { Pool, types } from 'pg'
import { config } from '../config/env'
import type { Database } from './types'

// Return DATE columns (OID 1082) as the raw 'YYYY-MM-DD' string instead of a
// JS Date. Otherwise pg builds a Date that serializes to a full ISO timestamp,
// which <input type="date"> rejects — making birth_date appear to reset.
types.setTypeParser(1082, (value) => value)

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: config.databaseUrl,
    max: 10,
  }),
})

/** Shared, fully-typed Kysely connection used by every service. */
export const db = new Kysely<Database>({ dialect })

export type { Database } from './types'
