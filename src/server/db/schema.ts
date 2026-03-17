import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

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
  isHeadOf: integer("isHeadOf", { mode: "boolean" }).notNull().default(false),
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

  phoneNumber: text("phoneNumber"),
  privateEmail: text("privateEmail"),
  linkedInUrl: text("linkedInUrl"),

  isProfileComplete: integer("isProfileComplete", { mode: "boolean" }).notNull().default(false),
});

export const talent = sqliteTable("talent", {
  id: text("id").primaryKey(),
  category: text("category", { enum: ["driver_license", "gastronomy"] }).notNull(),
  key: text("key").notNull().unique(),
});

export const userTalent = sqliteTable(
  "user_talent",
  {
    userId: text("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    talentId: text("talentId")
      .notNull()
      .references(() => talent.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.talentId] }),
  }),
);

export const shifts = sqliteTable(
  "shifts",
  {
    id: text("id").primaryKey(),
    location: text("location").notNull(),
    task: text("task").notNull(),
    description: text("description"),
    notionLink: text("notionLink"),
    startTime: integer("startTime", { mode: "timestamp" }).notNull(),
    endTime: integer("endTime", { mode: "timestamp" }).notNull(),
    createdBy: text("createdBy")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  },
  (table) => ({
    startTimeIdx: index("shifts_start_time_idx").on(table.startTime),
    locationIdx: index("shifts_location_idx").on(table.location),
  }),
);

export const shiftSlots = sqliteTable(
  "shift_slots",
  {
    id: text("id").primaryKey(),
    shiftId: text("shiftId")
      .notNull()
      .references(() => shifts.id, { onDelete: "cascade" }),
    slotTime: integer("slotTime", { mode: "timestamp" }).notNull(),
    headcount: integer("headcount").notNull().default(0),
  },
  (table) => ({
    slotTimeIdx: index("shift_slots_slot_time_idx").on(table.slotTime),
  }),
);

export const shiftSkills = sqliteTable(
  "shift_skills",
  {
    id: text("id").primaryKey(),
    shiftId: text("shiftId")
      .notNull()
      .references(() => shifts.id, { onDelete: "cascade" }),
    talentId: text("talentId")
      .notNull()
      .references(() => talent.id, { onDelete: "cascade" }),
  },
  (table) => ({
    shiftIdTalentIdUnique: uniqueIndex("shift_skills_shift_id_talent_id_unique").on(
      table.shiftId,
      table.talentId,
    ),
  }),
);

export const shiftTools = sqliteTable("shift_tools", {
  id: text("id").primaryKey(),
  shiftId: text("shiftId")
    .notNull()
    .references(() => shifts.id, { onDelete: "cascade" }),
  tool: text("tool", { enum: ["car", "van", "equipment"] }).notNull(),
});
