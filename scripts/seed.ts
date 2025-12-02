import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "../src/db";
import { account, event, session, user, userEmbedding, verification } from "../src/db/schema";

// Helper to generate mock 1024-dimensional vector
function generateMockEmbedding(): number[] {
  return Array.from({ length: 1024 }, () => Math.random() * 2 - 1);
}

// Seed user definitions
type SeedUser = {
  name: string;
  email: string;
  password: string;
  role: "member" | "creator" | "admin";
  phone: string;
  emailVerified: boolean;
};

const seedUsers: SeedUser[] = [
  // Members
  {
    name: "alice_runner",
    email: "alice@example.com",
    password: "secret12",
    role: "member",
    phone: "+62812345601",
    emailVerified: true,
  },
  {
    name: "bob_athlete",
    email: "bob@example.com",
    password: "secret12",
    role: "member",
    phone: "+62812345602",
    emailVerified: true,
  },
  // Creators
  {
    name: "charlie_photo",
    email: "charlie@example.com",
    password: "secret12",
    role: "creator",
    phone: "+628123456789",
    emailVerified: true,
  },
  {
    name: "diana_lens",
    email: "diana@example.com",
    password: "secret12",
    role: "creator",
    phone: "+628987654321",
    emailVerified: true,
  },
  // Admins
  {
    name: "admin_eve",
    email: "eve@runcam.dev",
    password: "secret12",
    role: "admin",
    phone: "+62811111111",
    emailVerified: true,
  },
  {
    name: "admin_frank",
    email: "frank@runcam.dev",
    password: "secret12",
    role: "admin",
    phone: "+62822222222",
    emailVerified: true,
  },
];

async function main() {
  console.info("Clearing existing data...");
  await db.delete(userEmbedding);
  await db.delete(event);
  await db.delete(user);
  await db.delete(verification);
  await db.delete(session);
  await db.delete(account);

  console.info("Seeding users...");
  const createdUserIds: string[] = [];

  for (const seedUser of seedUsers) {
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: seedUser.name,
          email: seedUser.email,
          password: seedUser.password,
        },
      });

      await db
        .update(user)
        .set({
          role: seedUser.role,
          phone: seedUser.phone,
          emailVerified: seedUser.emailVerified ?? false,
        })
        .where(eq(user.id, res.user.id));

      createdUserIds.push(res.user.id);
      console.info(`  ✓ Created ${seedUser.role}: ${seedUser.name}`);
    } catch (error) {
      console.error(`  ✗ Failed to create user ${seedUser.name}:`, error);
      throw error;
    }
  }

  console.info("Seeding user face embeddings...");
  const seedUserEmbeddings = createdUserIds.map((userId) => ({
    userId,
    embedding: generateMockEmbedding(),
  }));
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
      createdBy: createdUserIds[4], // admin_eve
    },
    {
      name: "Bali Fun Run",
      description: "Charity fun run in Bali",
      location: "Sanur Beach, Bali",
      startsAt: new Date("2025-12-15T07:00:00Z"),
      visibility: "public" as const,
      createdBy: createdUserIds[4], // admin_eve
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
