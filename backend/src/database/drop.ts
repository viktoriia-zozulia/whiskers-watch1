import { db } from "./db";

async function runDrop() {
  console.log("Dropping old tables...");

  try {
    await db.schema.dropTable("measurements").ifExists().execute();
    await db.schema.dropTable("medical_records").ifExists().execute();
    await db.schema.dropTable("tasks").ifExists().execute();
    await db.schema.dropTable("pets").ifExists().execute();
    await db.schema.dropTable("vet_contacts").ifExists().execute();
    await db.schema.dropTable("user_settings").ifExists().execute();
    await db.schema.dropTable("users").ifExists().execute();

    console.log("All tables dropped successfully. Database is clean!");
  } catch (error) {
    console.error("Failed to drop tables:", error);
  } finally {
    await db.destroy();
  }
}

runDrop();
