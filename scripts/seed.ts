import { db } from "../src/db";
import { user, usersTable } from "../src/db/schema";

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

const seedUsers2 = [
  {
    id: "user1",
    name: "Ravigion Kommelby Rafdonia",
    age: 36,
    email: "r.k.rafdonia@example.com",
  },
  {
    id: "user2",
    name: "Diplan Groundel Gabrielius",
    age: 41,
    email: "dggabrielius@example.com",
  },
  {
    id: "user3",
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

  console.info("Clearing auth user table...");
  await db.delete(user);

  console.info("Seeding example auth users...");
  const inserted2 = await db.insert(user).values(seedUsers2).returning();

  console.info(`Seeded ${inserted2.length} users`);
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
