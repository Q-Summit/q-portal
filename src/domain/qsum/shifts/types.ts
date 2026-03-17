/* ──────────────────────────────────────────────────────────────────────────
 * Explicit Domain Primitives
 * ────────────────────────────────────────────────────────────────────────── */

export type Tool = "car" | "van" | "equipment" | "none";

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

export interface Shift {
  id: string;
  location: string;
  task: string;
  description?: string | null;
  notionLink?: string | null;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  createdAt: Date;
}

export interface ShiftSlot {
  id: string;
  shiftId: string;
  slotTime: Date;
  headcount: number;
}

export interface ShiftSkill {
  id: string;
  shiftId: string;
  talentId: string;
}

export interface ShiftTool {
  id: string;
  shiftId: string;
  tool: Tool;
}
