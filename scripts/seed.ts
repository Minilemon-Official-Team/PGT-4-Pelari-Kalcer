import { auth } from "@/lib/auth";
import { db } from "../src/db";
import { event, user, userEmbedding } from "../src/db/schema";

// Helper to generate mock 1024-dimensional vector
function generateMockEmbedding(): number[] {
  return Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
}

async function main() {
  console.info("Clearing existing data...");
  await db.delete(userEmbedding);
  await db.delete(event);
  await db.delete(user);

  const res = await auth.api.signUpEmail({
    body: {
      name: "alice_runner",
      email: "alice@example.com",
      password: "secret12",
    },
  });
  res.user.role = "member";
  res.user.phone = "+62812345601";
  res.user.emailVerified = true;

  const res2 = await auth.api.signUpEmail({
    body: {
      name: "bob_athlete",
      email: "bob@example.com",
      password: "secret12",
    },
  });
  res2.user.role = "member";
  res2.user.phone = "+62812345602";

  const res3 = await auth.api.signUpEmail({
    body: {
      name: "charlie_photo",
      email: "charlie@example.com",
      password: "secret12",
    },
  });
  res3.user.role = "creator";
  res3.user.phone = "+628123456789";

  const res4 = await auth.api.signUpEmail({
    body: {
      name: "diana_lens",
      email: "diana@example.com",
      password: "secret12",
    },
  });
  res4.user.role = "creator";
  res4.user.phone = "+628987654321";

  const res5 = await auth.api.signUpEmail({
    body: {
      name: "admin_eve",
      email: "eve@runcam.dev",
      password: "secret12",
    },
  });
  res5.user.role = "admin";
  res5.user.phone = "+62811111111";

  const res6 = await auth.api.signUpEmail({
    body: {
      name: "admin_frank",
      email: "frank@runcam.dev",
      password: "secret12",
    },
  });
  res6.user.role = "admin";
  res6.user.phone = "+62822222222";

  console.info("Seeding user face embeddings...");
  const result = await db.select({ id: user.id }).from(user);
  const seedUserEmbeddings = [
    // Members
    { userId: result[0].id, embedding: generateMockEmbedding() },
    { userId: result[1].id, embedding: generateMockEmbedding() },
    // Creators
    { userId: result[2].id, embedding: generateMockEmbedding() },
    { userId: result[3].id, embedding: generateMockEmbedding() },
    // Admins
    { userId: result[4].id, embedding: generateMockEmbedding() },
    { userId: result[5].id, embedding: generateMockEmbedding() },
  ];
  const insertedEmbeddings = await db.insert(userEmbedding).values(seedUserEmbeddings).returning();
  console.info(`Seeded ${insertedEmbeddings.length} face embeddings`);

  console.info("Seeding events...");

  const seedEvents = [
    {
      name: "Jakarta Marathon 2025",
      description: "Annual marathon event in Jakarta",
      location: "Bundaran HI, Jakarta",
      startsAt: new Date("2025-12-01T06:00:00Z"),
      visibility: "public" as const,
      createdBy: result[4].id,
    },
    {
      name: "Bali Fun Run",
      description: "Charity fun run in Bali",
      location: "Sanur Beach, Bali",
      startsAt: new Date("2025-12-15T07:00:00Z"),
      visibility: "public" as const,
      createdBy: result[4].id,
    },
  ];

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
