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

export type TalentCategory = "driver_license" | "gastronomy";

export type TalentKey = "driver_18plus" | "driver_21plus" | "driver_c1" | "gastro";

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
  lastActiveYear?: number | null;
  division: Division;
  team: Team;
  teamOther?: string | null;
  phoneNumber?: string | null;
  privateEmail?: string | null;
  linkedInUrl?: string | null;
  isProfileComplete: boolean;
}

export interface Talent {
  id: string;
  category: TalentCategory;
  key: TalentKey;
}
