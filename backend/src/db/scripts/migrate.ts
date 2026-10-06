import { sql } from 'kysely'
import { db } from '../index'

/**
 * Creates the full relational schema in PostgreSQL.
 * Idempotent: safe to re-run (uses IF NOT EXISTS everywhere).
 */
async function runMigration() {
  console.log('Starting database migration...')

  try {
    // 1. users
    await db.schema
      .createTable('users')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('email', 'varchar', (col) => col.notNull().unique())
      .addColumn('password_hash', 'varchar', (col) => col.notNull())
      .addColumn('name', 'varchar', (col) => col.notNull())
      .execute()
    console.log('Table "users" has been successfully created.')

    // 2. user_settings (1:1 with users)
    await db.schema
      .createTable('user_settings')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull().unique(),
      )
      .addColumn('push_enabled', 'boolean', (col) => col.defaultTo(true).notNull())
      .addColumn('email_enabled', 'boolean', (col) => col.defaultTo(true).notNull())
      .execute()
    console.log('Table "user_settings" has been successfully created.')

    // 3. vet_contacts (1:M with users)
    await db.schema
      .createTable('vet_contacts')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull(),
      )
      .addColumn('doc_name', 'varchar')
      .addColumn('clinic', 'varchar', (col) => col.notNull())
      .addColumn('phone', 'varchar')
      .execute()
    console.log('Table "vet_contacts" has been successfully created.')

    // 4. pets (1:M with users)
    await db.schema
      .createTable('pets')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('user_id', 'integer', (col) =>
        col.references('users.id').onDelete('cascade').notNull(),
      )
      .addColumn('name', 'varchar', (col) => col.notNull())
      .addColumn('species', 'varchar', (col) => col.notNull())
      .addColumn('breed', 'varchar')
      .addColumn('birth_date', 'date')
      .addColumn('weight', 'real')
      .addColumn('allergies', 'text')
      .addColumn('photo_url', 'text')
      .execute()
    console.log('Table "pets" has been successfully created.')

    // 5. tasks (1:M with pets)
    await db.schema
      .createTable('tasks')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('pet_id', 'integer', (col) =>
        col.references('pets.id').onDelete('cascade').notNull(),
      )
      .addColumn('title', 'varchar', (col) => col.notNull())
      .addColumn('type', 'varchar', (col) => col.notNull())
      .addColumn('task_time', 'timestamp', (col) => col.notNull())
      .addColumn('is_done', 'boolean', (col) => col.defaultTo(false).notNull())
      .execute()
    console.log('Table "tasks" has been successfully created.')

    // 6. medical_records (1:M with pets)
    await db.schema
      .createTable('medical_records')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('pet_id', 'integer', (col) =>
        col.references('pets.id').onDelete('cascade').notNull(),
      )
      .addColumn('record_date', 'timestamp', (col) => col.notNull())
      .addColumn('record_type', 'varchar', (col) => col.notNull())
      .addColumn('text', 'text', (col) => col.notNull())
      .addColumn('photo_url', 'text')
      .execute()
    console.log('Table "medical_records" has been successfully created.')

    // 7. measurements (1:M with pets)
    await db.schema
      .createTable('measurements')
      .ifNotExists()
      .addColumn('id', 'serial', (col) => col.primaryKey())
      .addColumn('pet_id', 'integer', (col) =>
        col.references('pets.id').onDelete('cascade').notNull(),
      )
      .addColumn('date_measured', 'date', (col) => col.notNull())
      .addColumn('weight_kg', 'real', (col) => col.notNull())
      .addColumn('notes', 'text')
      .execute()
    console.log('Table "measurements" has been successfully created.')

    // 8. Idempotent column additions for existing databases
    await sql`ALTER TABLE pets ADD COLUMN IF NOT EXISTS photo_url text`.execute(db)
    await sql`ALTER TABLE medical_records ADD COLUMN IF NOT EXISTS photo_url text`.execute(db)
    console.log('Optional columns (photo_url) ensured.')

    // 9. Google OAuth support: nullable password (social-only users) + google_id
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id varchar`.execute(db)
    await sql`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`.execute(db)
    console.log('Google OAuth columns ensured.')

    // 10. One-click demo sandboxes: flag + timestamp so stale ones can be purged
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false`.execute(db)
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now()`.execute(db)
    console.log('Demo account columns ensured.')

    // 11. Uploaded images live in Postgres, so the app works on hosts with an
    //     ephemeral filesystem and a user's photos are deleted with the user.
    await sql`
      CREATE TABLE IF NOT EXISTS uploads (
        name varchar PRIMARY KEY,
        user_id integer REFERENCES users(id) ON DELETE CASCADE,
        mime varchar NOT NULL,
        data bytea NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`.execute(db)
    console.log('Table "uploads" ensured.')

    // 12. Indexes for the hot per-pet / per-user lookups
    await sql`CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets (user_id)`.execute(db)
    await sql`CREATE INDEX IF NOT EXISTS tasks_pet_id_time_idx ON tasks (pet_id, task_time)`.execute(db)
    await sql`CREATE INDEX IF NOT EXISTS records_pet_id_date_idx ON medical_records (pet_id, record_date DESC)`.execute(db)
    await sql`CREATE INDEX IF NOT EXISTS measurements_pet_id_date_idx ON measurements (pet_id, date_measured DESC)`.execute(db)
    await sql`CREATE INDEX IF NOT EXISTS vet_contacts_user_id_idx ON vet_contacts (user_id)`.execute(db)
    console.log('Indexes ensured.')

    console.log('Database migration completed successfully.')
  } catch (error) {
    console.error('Migration failed with error:', error)
    process.exitCode = 1
  } finally {
    await db.destroy()
  }
}

runMigration()
