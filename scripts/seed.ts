import { db } from "../src/db";
import { usersTable } from "../src/db/schema";

const seedUsers = [
  {
    name: "Ravigion Kommelby Rafdonia",
    age: 36,
    email: "r.k.rafdonia@example.com",
  },
  {
    name: "Diplan Groundel Gabrielius",
    age: 41,
    email: "dggabrielius@example.com",
  },
  {
    name: "Elise Groundia",
    age: 39,
    email: "egroundia@example.com",
  },
];

async function main() {
  console.info("Clearing users table...");
  await db.delete(usersTable);

  console.info("Seeding example users...");
  const inserted = await db.insert(usersTable).values(seedUsers).returning();

  console.info(`Seeded ${inserted.length} users`);
}

main().then(
  () => {
    process.exit(0);
  },
  (error) => {
    console.error("Failed to seed database");
    console.error(error);
    process.exit(1);
  },
);
