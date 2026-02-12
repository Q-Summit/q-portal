/* ──────────────────────────────────────────────────────────────────────────
 * Explicit Domain Primitives
 * ────────────────────────────────────────────────────────────────────────── */

export type Status = "active" | "alumni";

export type Division = "chair" | "finance" | "operations" | "partner" | "pr";

export type Team =
  | "hack"
  | "hc"
  | "it"
  | "legal"
  | "concept"
  | "oc"
  | "participants"
  | "startup"
  | "corporate"
  | "speaker"
  | "marketing"
  | "gp"
  | "other";

/* ──────────────────────────────────────────────────────────────────────────
 * UI & Helper Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export interface LabeledValue<T extends string> {
  value: T;
  label: string;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Domain Entities
 * ────────────────────────────────────────────────────────────────────────── */

export interface MemberProfile {
  userId: string;
  status: Status;
  lastActiveYear?: number;
  division: Division;
  team: Team;
  teamOther?: string;
  isProfileComplete: boolean;
}
