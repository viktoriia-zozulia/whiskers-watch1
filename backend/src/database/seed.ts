import { db } from "./db";

async function runSeed() {
  console.log("Starting database seeding...");

  try {
    // 1. Insert a test user
    const userResult = await db
      .insertInto("users")
      .values({
        email: "zozulia.v@khnure.ua",
        password_hash: "$2b$10$rB7KXY8mXmK5g8Y9z7q2uO", // Example hash
        name: "Viktoriia Zozulia",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const userId = userResult.id;
    console.log(`User inserted with ID: ${userId}`);

    // 2. Insert user settings
    await db
      .insertInto("user_settings")
      .values({
        user_id: userId,
        push_enabled: true,
        email_enabled: true,
      })
      .execute();
    console.log("User settings inserted.");

    // 3. Insert a vet contact
    await db
      .insertInto("vet_contacts")
      .values({
        user_id: userId,
        doc_name: "Dr. Alex Smith",
        clinic: "Central Veterinary Clinic",
        phone: "+380501234567",
      })
      .execute();
    console.log("Vet contact inserted.");

    // 4. Insert a pet linked to the user
    const petResult = await db
      .insertInto("pets")
      .values({
        user_id: userId,
        name: "Biscuit",
        species: "Cat",
        breed: "Domestic Shorthair",
        birth_date: "2023-05-10",
        weight: 4.5,
        allergies: "Chicken protein intolerance",
      })
      .returning("id")
      .executeTakeFirstOrThrow();

    const petId = petResult.id;
    console.log(`Pet inserted with ID: ${petId}`);

    // 5. Insert dummy tasks for the dashboard
    await db
      .insertInto("tasks")
      .values([
        {
          pet_id: petId,
          title: "Give morning vitamins",
          type: "Medication",
          task_time: new Date("2026-05-21T09:00:00Z"),
          is_done: true,
        },
        {
          pet_id: petId,
          title: "Annual rabies vaccination visit",
          type: "Clinic",
          task_time: new Date("2026-06-15T11:30:00Z"),
          is_done: false,
        },
      ])
      .execute();
    console.log("Tasks inserted.");

    // 6. Insert a medical record (One-Click Log entry)
    await db
      .insertInto("medical_records")
      .values({
        pet_id: petId,
        record_date: new Date("2026-05-20T14:20:00Z"),
        record_type: "Symptom Log",
        text: "The pet showed mild lethargy in the afternoon. Refused dry food but drank normal amount of water.",
      })
      .execute();
    console.log("Medical record inserted.");

    // 7. Insert weight measurement history
    await db
      .insertInto("measurements")
      .values({
        pet_id: petId,
        date_measured: "2026-05-01",
        weight_kg: 4.5,
        notes: "Routine monthly weight check.",
      })
      .execute();
    console.log("Weight measurement inserted.");

    console.log("Database seeding completed successfully.");
  } catch (error) {
    console.error("Seeding failed with error:", error);
  } finally {
    await db.destroy();
  }
}

runSeed();
