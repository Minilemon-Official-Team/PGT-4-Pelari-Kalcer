import {
  boolean,
  customType,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

// ------------------------------------------
// CUSTOM TYPES
// ------------------------------------------

export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return "vector(128)";
  },
  toDriver(value: number[]): string {
    return JSON.stringify(value);
  },
  fromDriver(value: string): number[] {
    return JSON.parse(value);
  },
});

// ------------------------------------------
// ENUMS
// ------------------------------------------

export const userRoleEnum = pgEnum("user_role", ["member", "creator", "admin"]);

export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);

export const eventVisibilityEnum = pgEnum("event_visibility", ["public", "unlisted"]);

export const photoStatusEnum = pgEnum("photo_status", [
  "pending",
  "processing",
  "ready",
  "failed",
  "hidden",
  "deleted",
]);

export const claimStatusEnum = pgEnum("claim_status", ["pending", "approved", "rejected"]);

// ------------------------------------------
// AUTHENTICATION (Better-Auth)
// ------------------------------------------

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: userRoleEnum("role").notNull().default("member"),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const sessionTable = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
});

export const accountTable = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
});

export const verificationTable = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ------------------------------------------
// CORE DOMAIN
// ------------------------------------------

export const creatorRequestsTable = pgTable("creator_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  status: requestStatusEnum("status").notNull().default("pending"),
  portfolioLink: text("portfolio_link"),
  motivation: text("motivation"),
  reviewedBy: text("reviewed_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const eventsTable = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  location: text("location"),
  image: text("image"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  visibility: eventVisibilityEnum("visibility").notNull().default("public"),
  createdBy: text("created_by")
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const photosTable = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => eventsTable.id),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => usersTable.id),
  originalName: text("original_name"),
  storagePathRaw: text("storage_path_raw").notNull(),
  storagePathDisplay: text("storage_path_display"),
  width: integer("width"),
  height: integer("height"),
  takenAt: timestamp("taken_at", { withTimezone: true }),
  status: photoStatusEnum("status").notNull().default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
  processingError: text("processing_error"),
  facesCount: integer("faces_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const photoEmbeddingsTable = pgTable("photo_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photosTable.id),
  embedding: vector("embedding").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userEmbeddingsTable = pgTable("user_embeddings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id),
  embedding: vector("embedding").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const claimsTable = pgTable("claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photosTable.id),
  claimantId: text("claimant_id")
    .notNull()
    .references(() => usersTable.id),
  status: claimStatusEnum("status").notNull().default("approved"),
  matchScore: real("match_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ------------------------------------------
// TYPE EXPORTS
// ------------------------------------------

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Session = typeof sessionTable.$inferSelect;
export type NewSession = typeof sessionTable.$inferInsert;

export type Account = typeof accountTable.$inferSelect;
export type NewAccount = typeof accountTable.$inferInsert;

export type Verification = typeof verificationTable.$inferSelect;
export type NewVerification = typeof verificationTable.$inferInsert;

export type CreatorRequest = typeof creatorRequestsTable.$inferSelect;
export type NewCreatorRequest = typeof creatorRequestsTable.$inferInsert;

export type Event = typeof eventsTable.$inferSelect;
export type NewEvent = typeof eventsTable.$inferInsert;

export type Photo = typeof photosTable.$inferSelect;
export type NewPhoto = typeof photosTable.$inferInsert;

export type PhotoEmbedding = typeof photoEmbeddingsTable.$inferSelect;
export type NewPhotoEmbedding = typeof photoEmbeddingsTable.$inferInsert;

export type UserEmbedding = typeof userEmbeddingsTable.$inferSelect;
export type NewUserEmbedding = typeof userEmbeddingsTable.$inferInsert;

export type Claim = typeof claimsTable.$inferSelect;
export type NewClaim = typeof claimsTable.$inferInsert;
