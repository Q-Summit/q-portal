import type { Division, LabeledValue, Status, TalentCategory, TalentKey, Team } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * Option Lists
 * ────────────────────────────────────────────────────────────────────────── */

export const STATUS_OPTIONS: readonly LabeledValue<Status>[] = [
  { value: "active", label: "Active Member" },
  { value: "alumni", label: "Alumni" },
] as const;

export const DIVISION_OPTIONS: readonly LabeledValue<Division>[] = [
  { value: "chair", label: "Chair" },
  { value: "finance", label: "Finance" },
  { value: "operations", label: "Operations" },
  { value: "partner", label: "Partner" },
  { value: "pr", label: "PR (Public Relations)" },
] as const;

/* ──────────────────────────────────────────────────────────────────────────
 * Hierarchy Mapping
 * ────────────────────────────────────────────────────────────────────────── */

export const TEAMS_BY_DIVISION: Record<Division, readonly LabeledValue<Team>[]> = {
  chair: [
    { value: "hack", label: "Hack" },
    { value: "hc", label: "HC" },
    { value: "other", label: "Other" },
  ],
  finance: [
    { value: "it", label: "IT" },
    { value: "legal", label: "Legal" },
    { value: "other", label: "Other" },
  ],
  operations: [
    { value: "concept", label: "Concept" },
    { value: "oc", label: "OC (On Conference)" },
    { value: "participants", label: "Participants" },
    { value: "other", label: "Other" },
  ],
  partner: [
    { value: "startup", label: "Startup" },
    { value: "corporate", label: "Corporate" },
    { value: "speaker", label: "Speaker" },
    { value: "other", label: "Other" },
  ],
  pr: [
    { value: "marketing", label: "Marketing" },
    { value: "gp", label: "G&P (Growth & Partnerships)" },
    { value: "other", label: "Other" },
  ],
};

export const TALENT_CATEGORY_LABELS: Record<TalentCategory, string> = {
  driver_license: "Driver's Licenses",
  gastronomy: "Gastronomy Experience",
};

export const TALENT_LABELS: Record<TalentKey, { label: string; subtitle: string }> = {
  driver_18plus: { label: "18+", subtitle: "Driver's license, at least 18 years old" },
  driver_21plus: {
    label: "21+ (no probation)",
    subtitle: "Driver's license, 21+ and out of probation period",
  },
  driver_c1: { label: "C1 License", subtitle: "Truck/transporter license (C1 or higher)" },
  gastro: { label: "Gastro Experience", subtitle: "Experience in gastronomy/catering" },
};
