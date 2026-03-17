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
  });

export type ShiftUpdateInput = z.infer<typeof ShiftUpdateSchema>;

/* ──────────────────────────────────────────────────────────────────────────
 * Normalizers
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Helper to clean up data before sending to DB.
 * Ensures consistent null states for optional fields.
 */
export function normalizeShiftCreateInput(input: ShiftCreateInput, createdBy: string) {
  return {
    location: input.location.trim(),
    task: input.task.trim(),
    description: input.description?.trim() ?? null,
    notionLink: input.notionLink?.trim() ?? null,
    startTime: input.startTime,
    endTime: input.endTime,
    createdBy,
    skillIds: input.skillIds,
    tools: input.tools,
    slots: input.slots,
  } as const;
}

export function normalizeShiftUpdateInput(input: ShiftUpdateInput) {
  return {
    id: input.id,
    location: input.location.trim(),
    task: input.task.trim(),
    description: input.description?.trim() ?? null,
    notionLink: input.notionLink?.trim() ?? null,
    startTime: input.startTime,
    endTime: input.endTime,
    skillIds: input.skillIds,
    tools: input.tools,
    slots: input.slots,
  } as const;
}
