import { z } from "zod";
import { TOOL_OPTIONS } from "./constants";
import type { Tool } from "./types";

/* ──────────────────────────────────────────────────────────────────────────
 * Zod Primitives (Derived from Constants)
 * ────────────────────────────────────────────────────────────────────────── */

const toolValues = TOOL_OPTIONS.map((o) => o.value) as [Tool, ...Tool[]];

/* ──────────────────────────────────────────────────────────────────────────
 * Slot Input Schema
 * ────────────────────────────────────────────────────────────────────────── */

export const SlotInputSchema = z.object({
  slotTime: z.coerce.date(),
  headcount: z.number().int().min(0).max(100),
});

export type SlotInput = z.infer<typeof SlotInputSchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * Main Validation Schemas
 * ────────────────────────────────────────────────────────────────────────── */

const notionUrlSchema = z
  .string()
  .trim()
  .url()
  .refine(
    (value) => {
      try {
        const url = new URL(value);
        const host = url.hostname.toLowerCase();
        return host === "notion.so" || host === "www.notion.so" || host.endsWith(".notion.so");
      } catch {
        return false;
      }
    },
    {
      message: "Notion URL must be on notion.so",
    },
  )
  .nullable();

export const ShiftCreateSchema = z
  .object({
    location: z.string().trim().min(1).max(200),
    task: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    notionLink: notionUrlSchema,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    skillIds: z.array(z.string().min(1)).default([]),
    tools: z.array(z.enum(toolValues)).default([]),
    slots: z.array(SlotInputSchema).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => new Set(data.skillIds).size === data.skillIds.length, {
    message: "skillIds must be unique",
    path: ["skillIds"],
  })
  .refine((data) => new Set(data.tools).size === data.tools.length, {
    message: "tools must be unique",
    path: ["tools"],
  });

export type ShiftCreateInput = z.infer<typeof ShiftCreateSchema>;

export const ShiftUpdateSchema = z
  .object({
    id: z.string().min(1),
    location: z.string().trim().min(1).max(200),
    task: z.string().trim().min(1).max(200),
    description: z.string().trim().max(2000).nullable(),
    notionLink: notionUrlSchema,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    skillIds: z.array(z.string().min(1)).default([]),
    tools: z.array(z.enum(toolValues)).default([]),
    slots: z.array(SlotInputSchema).optional(),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  })
  .refine((data) => new Set(data.skillIds).size === data.skillIds.length, {
    message: "skillIds must be unique",
    path: ["skillIds"],
  })
  .refine((data) => new Set(data.tools).size === data.tools.length, {
    message: "tools must be unique",
    path: ["tools"],
  });

export type ShiftUpdateInput = z.infer<typeof ShiftUpdateSchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * Normalizers
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Treats blank (empty or whitespace-only) strings as null for optional fields.
 * Used so optional description/notionLink are stored as null when absent.
 */
function blankToNull(s: string | null | undefined): string | null {
  const t = s?.trim();
  return t === undefined || t === "" ? null : t;
}

export function normalizeShiftCreateInput(input: ShiftCreateInput, createdBy: string) {
  return {
    location: input.location.trim(),
    task: input.task.trim(),
    description: blankToNull(input.description),
    notionLink: blankToNull(input.notionLink),
    startTime: input.startTime,
    endTime: input.endTime,
    createdBy,
    skillIds: [...new Set(input.skillIds)],
    tools: [...new Set(input.tools)],
    slots: input.slots,
  } as const;
}

export function normalizeShiftUpdateInput(input: ShiftUpdateInput) {
  return {
    id: input.id,
    location: input.location.trim(),
    task: input.task.trim(),
    description: blankToNull(input.description),
    notionLink: blankToNull(input.notionLink),
    startTime: input.startTime,
    endTime: input.endTime,
    skillIds: [...new Set(input.skillIds)],
    tools: [...new Set(input.tools)],
    slots: input.slots,
  } as const;
}
