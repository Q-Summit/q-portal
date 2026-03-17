import type { LabeledValue, Tool } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * Option Lists
 * ────────────────────────────────────────────────────────────────────────── */

export const TOOL_OPTIONS: readonly LabeledValue<Tool>[] = [
  { value: "none", label: "None" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "equipment", label: "Equipment" },
] as const;

/* ──────────────────────────────────────────────────────────────────────────
 * Defaults
 * ────────────────────────────────────────────────────────────────────────── */

/** Default shift duration in milliseconds (2 hours) */
export const DEFAULT_SHIFT_DURATION_MS = 2 * 60 * 60 * 1000;

/** Slot duration in milliseconds (30 minutes) */
export const SLOT_DURATION_MS = 30 * 60 * 1000;
