import { z } from "zod";
import { DIVISION_OPTIONS, STATUS_OPTIONS, TEAMS_BY_DIVISION } from "./constants";
import type { Division, Status, Team } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * Zod Primitives (Derived from Constants)
 * ────────────────────────────────────────────────────────────────────────── */

// Extract values for Zod enums explicitly so Zod knows they are valid
const statusValues = STATUS_OPTIONS.map((o) => o.value) as [Status, ...Status[]];
const divisionValues = DIVISION_OPTIONS.map((o) => o.value) as [Division, ...Division[]];

/* ──────────────────────────────────────────────────────────────────────────
 * Main Validation Schema
 * ────────────────────────────────────────────────────────────────────────── */

// Base object schema (without refinements) - needed for .extend()
const ProfileBaseSchema = z.object({
  status: z.enum(statusValues),
  lastActiveYear: z.number().int().min(2016).max(2100).nullable(),
  division: z.enum(divisionValues),
  team: z.string(), // Validated against division in superRefine
  teamOther: z.string().trim().min(2).max(80).nullable(),
});

// Shared refinement logic for profile validation
type ProfileBaseInput = z.infer<typeof ProfileBaseSchema>;
function refineProfile(val: ProfileBaseInput, ctx: z.RefinementCtx) {
  // 1. Alumni Logic: Must have a year
  if (val.status === "alumni" && val.lastActiveYear == null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["lastActiveYear"],
      message: "Please provide the last year you were active.",
    });
  }

  // 2. Active Logic: Should not have a year
  if (val.status === "active" && val.lastActiveYear != null) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["lastActiveYear"],
      message: "Active members should not set a last active year.",
    });
  }

  // 3. Division/Team logic
  // We cast to Division safely because Zod already checked division matches the enum above
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  const allowedTeams = TEAMS_BY_DIVISION[val.division as Division].map((t) => t.value);

  // Check if the string provided is actually a valid Team
  if (val.team !== "other" && !allowedTeams.includes(val.team as Team)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["team"],
      message: "Selected team does not belong to the chosen board area.",
    });
  }

  // 4. "Other" Logic
  if (val.team === "other" && !val.teamOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamOther"],
      message: "Please specify your team name.",
    });
  }

  // Cleanup: If team is NOT other, teamOther should be null (handled in mapping usually, but good to flag)
  if (val.team !== "other" && val.teamOther) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["teamOther"],
      message: "Only allowed when team is Other.",
    });
  }
}

export const ProfileUpdateSchema = ProfileBaseSchema.superRefine(refineProfile);

// Export the inferred type for use in routers
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;

const phoneNumberSchema = z
  .string()
  .trim()
  .min(6)
  .max(40)
  .regex(/^(?=.*\d)[+()\d\s.-]+$/);

const linkedInUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        return (
          host === "linkedin.com" || host === "www.linkedin.com" || host.endsWith(".linkedin.com")
        );
      } catch {
        return false;
      }
    },
    {
      message: "LinkedIn URL must be on linkedin.com",
    },
  );

export const ProfileEditSchema = ProfileBaseSchema.extend({
  phoneNumber: phoneNumberSchema.nullable(),
  privateEmail: z.string().trim().email().nullable(),
  linkedInUrl: linkedInUrlSchema.nullable(),
  talentIds: z.array(z.string().min(1)),
}).superRefine(refineProfile);

export type ProfileEditInput = z.infer<typeof ProfileEditSchema>;

/**
 * Helper to clean up data before sending to DB.
 * Ensures consistent null states for logic dependent fields.
 */
export function normalizeProfileInput(userId: string, input: ProfileUpdateInput) {
  return {
    userId,
    status: input.status,
    division: input.division,
    // I checked this in superRefine, trust me it's a Team, Typescript y.y
    team: input.team as Team,

    // Ensure data consistency
    teamOther: input.team === "other" ? input.teamOther : null,
    lastActiveYear: input.status === "alumni" ? input.lastActiveYear : null,
    isProfileComplete: true,
  } as const;
}

export function normalizeProfileEditInput(userId: string, input: ProfileEditInput) {
  return {
    userId,
    status: input.status,
    division: input.division,
    team: input.team as Team,
    teamOther: input.team === "other" ? input.teamOther : null,
    lastActiveYear: input.status === "alumni" ? input.lastActiveYear : null,
    phoneNumber: input.phoneNumber ? input.phoneNumber.trim() : null,
    privateEmail: input.privateEmail ? input.privateEmail.trim() : null,
    linkedInUrl: input.linkedInUrl ? input.linkedInUrl.trim() : null,
    isProfileComplete: true,
  } as const;
}
