import { db } from "./db";

async function runMigration() {
  console.log("Starting database migration...");

  try {
    // 1. Create users table
    await db.schema
      .createTable("users")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("email", "varchar", (col) => col.notNull().unique())
      .addColumn("password_hash", "varchar", (col) => col.notNull())
      .addColumn("name", "varchar", (col) => col.notNull())
      .execute();
    console.log('Table "users" has been successfully created.');

    // 2. Create user_settings table (1:1 relation with users)
    await db.schema
      .createTable("user_settings")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) =>
        col.references("users.id").onDelete("cascade").notNull().unique(),
      )
      .addColumn("push_enabled", "boolean", (col) =>
        col.defaultTo(true).notNull(),
      )
      .addColumn("email_enabled", "boolean", (col) =>
        col.defaultTo(true).notNull(),
      )
      .execute();
    console.log('Table "user_settings" has been successfully created.');

    // 3. Create vet_contacts table (1:M relation with users)
    await db.schema
      .createTable("vet_contacts")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) =>
        col.references("users.id").onDelete("cascade").notNull(),
      )
      .addColumn("doc_name", "varchar")
      .addColumn("clinic", "varchar", (col) => col.notNull())
      .addColumn("phone", "varchar")
      .execute();
    console.log('Table "vet_contacts" has been successfully created.');

    // 4. Create pets table (1:M relation with users)
    await db.schema
      .createTable("pets")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("user_id", "integer", (col) =>
        col.references("users.id").onDelete("cascade").notNull(),
      )
      .addColumn("name", "varchar", (col) => col.notNull())
      .addColumn("species", "varchar", (col) => col.notNull())
      .addColumn("breed", "varchar")
      .addColumn("birth_date", "date")
      .addColumn("weight", "real")
      .addColumn("allergies", "text")
      .execute();
    console.log('Table "pets" has been successfully created.');

    // 5. Create tasks table (1:M relation with pets)
    await db.schema
      .createTable("tasks")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("pet_id", "integer", (col) =>
        col.references("pets.id").onDelete("cascade").notNull(),
      )
      .addColumn("title", "varchar", (col) => col.notNull())
      .addColumn("type", "varchar", (col) => col.notNull())
      .addColumn("task_time", "timestamp", (col) => col.notNull())
      .addColumn("is_done", "boolean", (col) => col.defaultTo(false).notNull())
      .execute();
    console.log('Table "tasks" has been successfully created.');

    // 6. Create medical_records table (1:M relation with pets)
    await db.schema
      .createTable("medical_records")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("pet_id", "integer", (col) =>
        col.references("pets.id").onDelete("cascade").notNull(),
      )
      .addColumn("record_date", "timestamp", (col) => col.notNull())
      .addColumn("record_type", "varchar", (col) => col.notNull())
      .addColumn("text", "text", (col) => col.notNull())
      .execute();
    console.log('Table "medical_records" has been successfully created.');

    // 7. Create measurements table (1:M relation with pets)
    await db.schema
      .createTable("measurements")
      .ifNotExists()
      .addColumn("id", "serial", (col) => col.primaryKey())
      .addColumn("pet_id", "integer", (col) =>
        col.references("pets.id").onDelete("cascade").notNull(),
      )
      .addColumn("date_measured", "date", (col) => col.notNull())
      .addColumn("weight_kg", "real", (col) => col.notNull())
      .addColumn("notes", "text")
      .execute();
    console.log('Table "measurements" has been successfully created.');

    console.log("Database migration completed successfully.");
  } catch (error) {
    console.error("Migration failed with error:", error);
  } finally {
    await db.destroy();
  }
}

runMigration();
