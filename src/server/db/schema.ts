import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Better Auth tables (do not rename columns unless you know what you're doing)
 * ──────────────────────────────────────────────────────────────────────────────
 */

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull(),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }),
  updatedAt: integer("updatedAt", { mode: "timestamp" }),
});

/**
 * ──────────────────────────────────────────────────────────────────────────────
 * Q-Portal domain tables
 * ──────────────────────────────────────────────────────────────────────────────
 */

/**
 * Q-Summit member profile (user-provided onboarding metadata).
 *
 * Notes:
 * - No user-editable "roles" (head/board/etc.). Admin UI will manage that later.
 * - "Chair" is modeled as a normal division (board area), so we don't need a chairman role.
 * - Alumni provide the last year they were active in Q-Summit.
 */
export const memberProfile = sqliteTable("member_profile", {
  userId: text("userId")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),

  status: text("status", { enum: ["active", "alumni"] }).notNull(),

  /**
   * For alumni: last year the person was active in Q-Summit.
   * For active members: must be null (active implies "current season").
   * Enforce via Zod/tRPC validation.
   */
  lastActiveYear: integer("lastActiveYear"),

  // Board area / division
  division: text("division", {
    enum: ["chair", "finance", "operations", "partner", "pr"],
  }).notNull(),

  /**
   * Team within the division.
   * - "none" for division-level members or edge cases.
   * - "other" allows alumni legacy teams without forcing mapping.
   */
  team: text("team", {
    enum: [
      "none",

      // Chair
      "hack",
      "hc",

      // Finance
      "it",
      "legal",

      // Operations
      "concept",
      "oc",
      "participants",

      // Partner
      "startup",
      "corporate",
      "speaker",

      // PR
      "marketing",
      "gp",

      "other",
    ],
  }).notNull(),

  teamOther: text("teamOther"),

  isProfileComplete: integer("isProfileComplete", { mode: "boolean" }).notNull().default(false),
});
