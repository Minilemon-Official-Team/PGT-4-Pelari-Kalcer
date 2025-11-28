import { db } from "../src/db";
import { event, user, userEmbedding } from "../src/db/schema";

// Helper to generate mock 1024-dimensional vector
function generateMockEmbedding(): number[] {
  return Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
}

const seedUsers = [
  // Members
  {
    id: "member-1",
    username: "alice_runner",
    email: "alice@example.com",
    emailVerified: true,
    role: "member" as const,
    phone: "+62812345601",
  },
  {
    id: "member-2",
    username: "bob_athlete",
    email: "bob@example.com",
    emailVerified: true,
    role: "member" as const,
    phone: "+62812345602",
  },
  // Creators
  {
    id: "creator-1",
    username: "charlie_photo",
    email: "charlie@example.com",
    emailVerified: true,
    role: "creator" as const,
    phone: "+628123456789",
  },
  {
    id: "creator-2",
    username: "diana_lens",
    email: "diana@example.com",
    emailVerified: true,
    role: "creator" as const,
    phone: "+628987654321",
  },
  // Admins
  {
    id: "admin-1",
    username: "admin_eve",
    email: "eve@runcam.dev",
    emailVerified: true,
    role: "admin" as const,
    phone: "+62811111111",
  },
  {
    id: "admin-2",
    username: "admin_frank",
    email: "frank@runcam.dev",
    emailVerified: true,
    role: "admin" as const,
    phone: "+62822222222",
  },
];

const seedEvents = [
  {
    name: "Jakarta Marathon 2025",
    description: "Annual marathon event in Jakarta",
    location: "Bundaran HI, Jakarta",
    startsAt: new Date("2025-12-01T06:00:00Z"),
    visibility: "public" as const,
    createdBy: "admin-1",
  },
  {
    name: "Bali Fun Run",
    description: "Charity fun run in Bali",
    location: "Sanur Beach, Bali",
    startsAt: new Date("2025-12-15T07:00:00Z"),
    visibility: "public" as const,
    createdBy: "admin-1",
  },
];

async function main() {
  console.info("Clearing existing data...");
  await db.delete(userEmbedding);
  await db.delete(event);
  await db.delete(user);

  console.info("Seeding users...");
  const insertedUsers = await db.insert(user).values(seedUsers).returning();
  console.info(`Seeded ${insertedUsers.length} users`);

  console.info("Seeding user face embeddings...");
  const seedUserEmbeddings = [
    // Members
    { userId: "member-1", embedding: generateMockEmbedding() },
    { userId: "member-2", embedding: generateMockEmbedding() },
    // Creators
    { userId: "creator-1", embedding: generateMockEmbedding() },
    { userId: "creator-2", embedding: generateMockEmbedding() },
    // Admins
    { userId: "admin-1", embedding: generateMockEmbedding() },
    { userId: "admin-2", embedding: generateMockEmbedding() },
  ];
  const insertedEmbeddings = await db.insert(userEmbedding).values(seedUserEmbeddings).returning();
  console.info(`Seeded ${insertedEmbeddings.length} face embeddings`);

  console.info("Seeding events...");
  const insertedEvents = await db.insert(event).values(seedEvents).returning();
  console.info(`Seeded ${insertedEvents.length} events`);

  console.info("\nDatabase seeding completed!");
  console.info("\nSeeded accounts:");
  console.info("  Members:  alice_runner, bob_athlete");
  console.info("  Creators: charlie_photo, diana_lens");
  console.info("  Admins:   admin_eve, admin_frank");
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
