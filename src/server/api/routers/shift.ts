/**
 * Shift router - handles shift planning CRUD and scheduling.
 */
import {
  ShiftCreateSchema,
  ShiftUpdateSchema,
  normalizeShiftCreateInput,
  normalizeShiftUpdateInput,
  type SlotInput,
} from "@/domain/qsum/shifts";
import { createTRPCRouter, plannerProcedure, protectedProcedure } from "@/server/api/trpc";
import { shiftSkills, shiftSlots, shiftTools, shifts } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, asc, count, desc, eq, gte, inArray, like, lt, lte, sql } from "drizzle-orm";
import { z } from "zod";

const SLOT_INTERVAL_MS = 30 * 60 * 1000;

function assertThirtyMinuteBoundary(date: Date, fieldName: string) {
  if (date.getTime() % SLOT_INTERVAL_MS !== 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `${fieldName} must be on a 30-minute boundary`,
    });
  }
}

function buildShiftSlots(startTime: Date, endTime: Date, inputSlots?: SlotInput[]) {
  assertThirtyMinuteBoundary(startTime, "startTime");
  assertThirtyMinuteBoundary(endTime, "endTime");

  if (inputSlots && inputSlots.length > 0) {
    const seen = new Set<number>();

    const normalizedSlots = inputSlots
      .map((slot) => ({
        slotTime: new Date(slot.slotTime),
        headcount: slot.headcount,
      }))
      .sort((a, b) => a.slotTime.getTime() - b.slotTime.getTime());

    for (const slot of normalizedSlots) {
      assertThirtyMinuteBoundary(slot.slotTime, "slotTime");

      const timestamp = slot.slotTime.getTime();
      if (timestamp < startTime.getTime() || timestamp >= endTime.getTime()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "slotTime must be within the shift time range",
        });
      }

      if (seen.has(timestamp)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Duplicate slotTime values are not allowed",
        });
      }

      seen.add(timestamp);
    }

    return normalizedSlots;
  }

  const slots: { slotTime: Date; headcount: number }[] = [];
  for (let ts = startTime.getTime(); ts < endTime.getTime(); ts += SLOT_INTERVAL_MS) {
    slots.push({ slotTime: new Date(ts), headcount: 0 });
  }

  return slots;
}

export const shiftRouter = createTRPCRouter({
  create: plannerProcedure.input(ShiftCreateSchema).mutation(async ({ ctx, input }) => {
    const normalizedInput = normalizeShiftCreateInput(input, ctx.session.user.id);
    const shiftId = crypto.randomUUID();
    const slots = buildShiftSlots(
      normalizedInput.startTime,
      normalizedInput.endTime,
      normalizedInput.slots,
    );

    await ctx.db.transaction(async (tx) => {
      await tx.insert(shifts).values({
        id: shiftId,
        location: normalizedInput.location,
        task: normalizedInput.task,
        description: normalizedInput.description,
        notionLink: normalizedInput.notionLink,
        startTime: normalizedInput.startTime,
        endTime: normalizedInput.endTime,
        createdBy: normalizedInput.createdBy,
        createdAt: new Date(),
      });

      await tx.insert(shiftSlots).values(
        slots.map((slot) => ({
          id: crypto.randomUUID(),
          shiftId,
          slotTime: slot.slotTime,
          headcount: slot.headcount,
        })),
      );

      if (normalizedInput.skillIds.length > 0) {
        await tx.insert(shiftSkills).values(
          normalizedInput.skillIds.map((talentId) => ({
            id: crypto.randomUUID(),
            shiftId,
            talentId,
          })),
        );
      }

      if (normalizedInput.tools.length > 0) {
        await tx.insert(shiftTools).values(
          normalizedInput.tools.map((tool) => ({
            id: crypto.randomUUID(),
            shiftId,
            tool,
          })),
        );
      }
    });

    return { ok: true, id: shiftId };
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const shift = await ctx.db.query.shifts.findFirst({
        where: eq(shifts.id, input.id),
      });

      if (!shift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found." });
      }

      const [slots, skills, tools] = await Promise.all([
        ctx.db
          .select({
            id: shiftSlots.id,
            slotTime: shiftSlots.slotTime,
            headcount: shiftSlots.headcount,
          })
          .from(shiftSlots)
          .where(eq(shiftSlots.shiftId, shift.id))
          .orderBy(shiftSlots.slotTime),
        ctx.db
          .select({ talentId: shiftSkills.talentId })
          .from(shiftSkills)
          .where(eq(shiftSkills.shiftId, shift.id)),
        ctx.db
          .select({ tool: shiftTools.tool })
          .from(shiftTools)
          .where(eq(shiftTools.shiftId, shift.id)),
      ]);

      return {
        ...shift,
        skillIds: skills.map((skill) => skill.talentId),
        tools: tools.map((tool) => tool.tool),
        slots,
      };
    }),

  update: plannerProcedure.input(ShiftUpdateSchema).mutation(async ({ ctx, input }) => {
    const normalizedInput = normalizeShiftUpdateInput(input);
    const slots = buildShiftSlots(
      normalizedInput.startTime,
      normalizedInput.endTime,
      normalizedInput.slots,
    );

    const existingShift = await ctx.db.query.shifts.findFirst({
      where: eq(shifts.id, normalizedInput.id),
      columns: { id: true },
    });

    if (!existingShift) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found." });
    }

    await ctx.db.transaction(async (tx) => {
      await tx
        .update(shifts)
        .set({
          location: normalizedInput.location,
          task: normalizedInput.task,
          description: normalizedInput.description,
          notionLink: normalizedInput.notionLink,
          startTime: normalizedInput.startTime,
          endTime: normalizedInput.endTime,
        })
        .where(eq(shifts.id, normalizedInput.id));

      await tx.delete(shiftSlots).where(eq(shiftSlots.shiftId, normalizedInput.id));
      await tx.delete(shiftSkills).where(eq(shiftSkills.shiftId, normalizedInput.id));
      await tx.delete(shiftTools).where(eq(shiftTools.shiftId, normalizedInput.id));

      await tx.insert(shiftSlots).values(
        slots.map((slot) => ({
          id: crypto.randomUUID(),
          shiftId: normalizedInput.id,
          slotTime: slot.slotTime,
          headcount: slot.headcount,
        })),
      );

      if (normalizedInput.skillIds.length > 0) {
        await tx.insert(shiftSkills).values(
          normalizedInput.skillIds.map((talentId) => ({
            id: crypto.randomUUID(),
            shiftId: normalizedInput.id,
            talentId,
          })),
        );
      }

      if (normalizedInput.tools.length > 0) {
        await tx.insert(shiftTools).values(
          normalizedInput.tools.map((tool) => ({
            id: crypto.randomUUID(),
            shiftId: normalizedInput.id,
            tool,
          })),
        );
      }
    });

    return { ok: true };
  }),

  delete: plannerProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existingShift = await ctx.db.query.shifts.findFirst({
        where: eq(shifts.id, input.id),
        columns: { id: true },
      });

      if (!existingShift) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Shift not found." });
      }

      await ctx.db.delete(shifts).where(eq(shifts.id, input.id));

      return { ok: true };
    }),

  list: protectedProcedure
    .input(
      z.object({
        cursor: z.number().int().nonnegative().default(0),
        limit: z.number().int().min(1).max(50).default(20),
        sortField: z.enum(["startTime", "location", "task", "createdAt"]).default("startTime"),
        sortDirection: z.enum(["asc", "desc"]).default("asc"),
        location: z.string().trim().max(200).optional(),
        startDate: z.coerce.date().optional(),
        endDate: z.coerce.date().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, sortField, sortDirection, location, startDate, endDate } = input;

      const conditions = [];
      if (location) conditions.push(like(shifts.location, `%${location}%`));
      if (startDate) conditions.push(gte(shifts.startTime, startDate));
      if (endDate) conditions.push(lte(shifts.startTime, endDate));
      const baseWhere = conditions.length > 0 ? and(...conditions) : undefined;

      const sortColumns = {
        startTime: shifts.startTime,
        location: shifts.location,
        task: shifts.task,
        createdAt: shifts.createdAt,
      } as const;
      const sortExpression =
        sortDirection === "desc" ? desc(sortColumns[sortField]) : asc(sortColumns[sortField]);

      const [totalResult, rows] = await Promise.all([
        ctx.db.select({ value: count() }).from(shifts).where(baseWhere),
        ctx.db
          .select({
            id: shifts.id,
            location: shifts.location,
            task: shifts.task,
            description: shifts.description,
            notionLink: shifts.notionLink,
            startTime: shifts.startTime,
            endTime: shifts.endTime,
            createdBy: shifts.createdBy,
            createdAt: shifts.createdAt,
          })
          .from(shifts)
          .where(baseWhere)
          .orderBy(sortExpression, asc(shifts.id))
          .limit(limit)
          .offset(cursor),
      ]);

      const shiftIds = rows.map((row) => row.id);
      const totalHeadcountByShift = new Map<string, number>();

      if (shiftIds.length > 0) {
        const slotRows = await ctx.db
          .select({
            shiftId: shiftSlots.shiftId,
            headcount: shiftSlots.headcount,
          })
          .from(shiftSlots)
          .where(inArray(shiftSlots.shiftId, shiftIds));

        for (const slot of slotRows) {
          totalHeadcountByShift.set(
            slot.shiftId,
            (totalHeadcountByShift.get(slot.shiftId) ?? 0) + slot.headcount,
          );
        }
      }

      const total = totalResult[0]?.value ?? 0;

      return {
        items: rows.map((row) => ({
          ...row,
          slotSummary: {
            totalHeadcount: totalHeadcountByShift.get(row.id) ?? 0,
          },
        })),
        total,
        nextCursor: cursor + limit < total ? cursor + limit : null,
      };
    }),

  calendar: protectedProcedure
    .input(
      z.object({
        date: z.coerce.date().refine((date) => {
          const isLocalQSummitDate =
            date.getFullYear() === 2026 &&
            date.getMonth() === 3 &&
            (date.getDate() === 9 || date.getDate() === 10);
          const isUtcQSummitDate =
            date.getUTCFullYear() === 2026 &&
            date.getUTCMonth() === 3 &&
            (date.getUTCDate() === 9 || date.getUTCDate() === 10);
          return isLocalQSummitDate || isUtcQSummitDate;
        }, "date must be April 9 or 10, 2026"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const dayStart = new Date(input.date);
      dayStart.setUTCHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

      const slotTimeFilter = and(
        gte(shiftSlots.slotTime, dayStart),
        lt(shiftSlots.slotTime, dayEnd),
      );

      const [totalRows, detailRows] = await Promise.all([
        ctx.db
          .select({
            slotTime: shiftSlots.slotTime,
            totalHeadcount: sql<number>`sum(${shiftSlots.headcount})`,
          })
          .from(shiftSlots)
          .where(slotTimeFilter)
          .groupBy(shiftSlots.slotTime)
          .orderBy(asc(shiftSlots.slotTime)),
        ctx.db
          .select({
            slotTime: shiftSlots.slotTime,
            shiftId: shifts.id,
            location: shifts.location,
            task: shifts.task,
            description: shifts.description,
            notionLink: shifts.notionLink,
            startTime: shifts.startTime,
            endTime: shifts.endTime,
            headcount: shiftSlots.headcount,
          })
          .from(shiftSlots)
          .innerJoin(shifts, eq(shifts.id, shiftSlots.shiftId))
          .where(slotTimeFilter)
          .orderBy(asc(shiftSlots.slotTime), asc(shifts.startTime), asc(shifts.id)),
      ]);

      const shiftsBySlot = new Map<
        number,
        {
          shiftId: string;
          location: string;
          task: string;
          description: string | null;
          notionLink: string | null;
          startTime: Date;
          endTime: Date;
          headcount: number;
        }[]
      >();

      for (const row of detailRows) {
        const slotKey = row.slotTime.getTime();
        const slotShifts = shiftsBySlot.get(slotKey) ?? [];
        slotShifts.push({
          shiftId: row.shiftId,
          location: row.location,
          task: row.task,
          description: row.description,
          notionLink: row.notionLink,
          startTime: row.startTime,
          endTime: row.endTime,
          headcount: row.headcount,
        });
        shiftsBySlot.set(slotKey, slotShifts);
      }

      return totalRows.map((row) => ({
        slotTime: row.slotTime,
        totalHeadcount: Number(row.totalHeadcount ?? 0),
        shifts: shiftsBySlot.get(row.slotTime.getTime()) ?? [],
      }));
    }),

  exportCsv: plannerProcedure.mutation(async ({ ctx }) => {
    // Query all shifts with their slots, skills, and tools
    const allShifts = await ctx.db.query.shifts.findMany({
      orderBy: [asc(shifts.startTime), asc(shifts.id)],
    });

    if (allShifts.length === 0) {
      return {
        csv: "shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link",
      };
    }

    const shiftById = new Map(allShifts.map((s) => [s.id, s]));

    const shiftIds = allShifts.map((s) => s.id);

    const [allSlots, allSkills, allTools] = await Promise.all([
      ctx.db
        .select({
          shiftId: shiftSlots.shiftId,
          slotTime: shiftSlots.slotTime,
          headcount: shiftSlots.headcount,
        })
        .from(shiftSlots)
        .where(inArray(shiftSlots.shiftId, shiftIds))
        .orderBy(asc(shiftSlots.shiftId), asc(shiftSlots.slotTime)),
      ctx.db
        .select({ shiftId: shiftSkills.shiftId, talentId: shiftSkills.talentId })
        .from(shiftSkills)
        .where(inArray(shiftSkills.shiftId, shiftIds)),
      ctx.db
        .select({ shiftId: shiftTools.shiftId, tool: shiftTools.tool })
        .from(shiftTools)
        .where(inArray(shiftTools.shiftId, shiftIds)),
    ]);

    // Aggregate skills and tools per shift
    const skillsByShift = new Map<string, string[]>();
    for (const skill of allSkills) {
      const existing = skillsByShift.get(skill.shiftId) ?? [];
      existing.push(skill.talentId);
      skillsByShift.set(skill.shiftId, existing);
    }

    const toolsByShift = new Map<string, string[]>();
    for (const tool of allTools) {
      const existing = toolsByShift.get(tool.shiftId) ?? [];
      existing.push(tool.tool);
      toolsByShift.set(tool.shiftId, existing);
    }

    // Build CSV rows
    const header =
      "shift_id;location;task;start_time;end_time;slot_time;headcount;skills;tools;notion_link";
    const rows: string[] = [header];

    for (const slot of allSlots) {
      const shift = shiftById.get(slot.shiftId);
      if (!shift) continue;

      const skills = (skillsByShift.get(slot.shiftId) ?? []).join(",");
      const tools = (toolsByShift.get(slot.shiftId) ?? []).join(",");

      const formatDateTime = (date: Date): string => {
        return date
          .toISOString()
          .replace("T", " ")
          .replace(/\.\d{3}Z$/, "");
      };

      // Escape semicolons in fields (shouldn't be any, but be safe)
      const escapeField = (value: string | null): string => {
        if (value === null) return "";
        if (value.includes(";") || value.includes('"') || value.includes("\n")) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };

      const row = [
        shift.id,
        escapeField(shift.location),
        escapeField(shift.task),
        formatDateTime(shift.startTime),
        formatDateTime(shift.endTime),
        formatDateTime(slot.slotTime),
        slot.headcount.toString(),
        skills,
        tools,
        escapeField(shift.notionLink),
      ].join(";");

      rows.push(row);
    }

    // UTF-8 BOM for German Excel compatibility
    const csv = "\uFEFF" + rows.join("\n");
    return { csv };
  }),
});
