import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
  vector,
} from "drizzle-orm/pg-core";

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

export const user = pgTable("user", {
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

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  password: text("password"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

// ------------------------------------------
// CORE DOMAIN
// ------------------------------------------

export const creatorRequest = pgTable("creator_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  status: requestStatusEnum("status").notNull().default("pending"),
  portfolioLink: text("portfolio_link"),
  motivation: text("motivation"),
  reviewedBy: text("reviewed_by").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const event = pgTable("event", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  location: text("location"),
  image: text("image"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  visibility: eventVisibilityEnum("visibility").notNull().default("public"),
  createdBy: text("created_by")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const photo = pgTable("photo", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id").references(() => event.id, { onDelete: "set null" }),
  uploaderId: text("uploader_id")
    .notNull()
    .references(() => user.id, { onDelete: "no action" }),
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

export const photoEmbedding = pgTable(
  "photo_embedding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photo.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("photo_embedding_l2_idx").using("hnsw", table.embedding.op("vector_l2_ops"))],
);

export const userEmbedding = pgTable(
  "user_embedding",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    embedding: vector("embedding", { dimensions: 1024 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("user_embedding_l2_idx").using("hnsw", table.embedding.op("vector_l2_ops"))],
);

export const claim = pgTable("claim", {
  id: uuid("id").primaryKey().defaultRandom(),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photo.id, { onDelete: "cascade" }),
  claimantId: text("claimant_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
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

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;

export type Session = typeof session.$inferSelect;
export type NewSession = typeof session.$inferInsert;

export type Account = typeof account.$inferSelect;
export type NewAccount = typeof account.$inferInsert;

export type Verification = typeof verification.$inferSelect;
export type NewVerification = typeof verification.$inferInsert;

export type CreatorRequest = typeof creatorRequest.$inferSelect;
export type NewCreatorRequest = typeof creatorRequest.$inferInsert;

export type Event = typeof event.$inferSelect;
export type NewEvent = typeof event.$inferInsert;

export type Photo = typeof photo.$inferSelect;
export type NewPhoto = typeof photo.$inferInsert;

export type PhotoEmbedding = typeof photoEmbedding.$inferSelect;
export type NewPhotoEmbedding = typeof photoEmbedding.$inferInsert;

export type UserEmbedding = typeof userEmbedding.$inferSelect;
export type NewUserEmbedding = typeof userEmbedding.$inferInsert;

export type Claim = typeof claim.$inferSelect;
export type NewClaim = typeof claim.$inferInsert;
