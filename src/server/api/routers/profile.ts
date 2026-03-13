/**
 * Profile router - handles member profile CRUD and talent management.
 */
import {
  ProfileEditSchema,
  ProfileUpdateSchema,
  normalizeProfileEditInput,
  normalizeProfileInput,
} from "@/domain/qsum/profile";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { memberProfile, talent, user, userTalent } from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, inArray, like, sql } from "drizzle-orm";
import { z } from "zod";

export const profileRouter = createTRPCRouter({
  getMy: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const { name, image } = ctx.session.user;

    const profile = await ctx.db.query.memberProfile.findFirst({
      where: eq(memberProfile.userId, userId),
    });

    if (!profile) {
      return { user: { name, image }, profile: null };
    }

    const talentRows: { talentId: string }[] = await ctx.db
      .select({ talentId: userTalent.talentId })
      .from(userTalent)
      .where(eq(userTalent.userId, userId));

    return {
      user: { name, image },
      profile: {
        ...profile,
        talentIds: talentRows.map((row) => row.talentId),
      },
    };
  }),

  listTalents: protectedProcedure.query(async ({ ctx }) => {
    const talents: { id: string; category: string; key: string }[] = await ctx.db
      .select({ id: talent.id, category: talent.category, key: talent.key })
      .from(talent)
      .orderBy(talent.category, talent.key);
    return talents;
  }),

  complete: protectedProcedure.input(ProfileUpdateSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;

    const dbValues = normalizeProfileInput(userId, input);

    // 3. Use Native Upsert (Cleaner & Faster than Select+Insert/Update)
    await ctx.db.insert(memberProfile).values(dbValues).onConflictDoUpdate({
      target: memberProfile.userId, // The unique constraint column
      set: dbValues,
    });

    return { ok: true };
  }),

  update: protectedProcedure.input(ProfileEditSchema).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const typedInput = input;
    const dbValues = normalizeProfileEditInput(userId, typedInput);

    await ctx.db.transaction(async (tx) => {
      await tx.insert(memberProfile).values(dbValues).onConflictDoUpdate({
        target: memberProfile.userId,
        set: dbValues,
      });

      if (typedInput.talentIds.length) {
        const validTalents: { id: string }[] = await tx
          .select({ id: talent.id })
          .from(talent)
          .where(inArray(talent.id, typedInput.talentIds));

        if (validTalents.length !== typedInput.talentIds.length) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "One or more talents are invalid.",
          });
        }
      }

      const existingTalents: { talentId: string }[] = await tx
        .select({ talentId: userTalent.talentId })
        .from(userTalent)
        .where(eq(userTalent.userId, userId));

      const existingIds = existingTalents.map((row) => row.talentId);
      const existingSet = new Set(existingIds);
      const nextSet = new Set(typedInput.talentIds);

      const toAdd = typedInput.talentIds.filter((id: string) => !existingSet.has(id));
      const toRemove = existingIds.filter((id) => !nextSet.has(id));

      if (toRemove.length) {
        await tx
          .delete(userTalent)
          .where(and(eq(userTalent.userId, userId), inArray(userTalent.talentId, toRemove)));
      }

      if (toAdd.length) {
        await tx.insert(userTalent).values(toAdd.map((talentId: string) => ({ userId, talentId })));
      }
    });

    return { ok: true };
  }),

  getByUserId: protectedProcedure
    .input(z.object({ userId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.db
        .select({
          name: user.name,
          image: user.image,
          status: memberProfile.status,
          division: memberProfile.division,
          team: memberProfile.team,
          teamOther: memberProfile.teamOther,
          lastActiveYear: memberProfile.lastActiveYear,
          phoneNumber: memberProfile.phoneNumber,
          privateEmail: memberProfile.privateEmail,
          linkedInUrl: memberProfile.linkedInUrl,
        })
        .from(user)
        .innerJoin(memberProfile, eq(memberProfile.userId, user.id))
        .where(eq(user.id, input.userId))
        .limit(1);

      const profile = rows[0];
      if (!profile) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Profile not found." });
      }

      const talentRows = await ctx.db
        .select({ key: talent.key, category: talent.category })
        .from(userTalent)
        .innerJoin(talent, eq(talent.id, userTalent.talentId))
        .where(eq(userTalent.userId, input.userId));

      return { ...profile, talents: talentRows };
    }),

  list: protectedProcedure
    .input(
      z.object({
        cursor: z.number().int().nonnegative().default(0),
        limit: z.number().int().min(1).max(50).default(20),
        search: z.string().max(100).default(""),
        division: z.string().max(50).optional(),
        team: z.string().max(50).optional(),
        year: z.number().int().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit, search, division, team, year } = input;

      const conditions = [];
      if (search) conditions.push(like(user.name, `%${search}%`));
      if (division) conditions.push(sql`${memberProfile.division} = ${division}`);
      if (team) conditions.push(sql`${memberProfile.team} = ${team}`);
      if (year) conditions.push(eq(memberProfile.lastActiveYear, year));
      const baseWhere = conditions.length ? and(...conditions) : undefined;

      const [totalResult, rows] = await Promise.all([
        ctx.db
          .select({ value: count() })
          .from(user)
          .innerJoin(memberProfile, eq(memberProfile.userId, user.id))
          .where(baseWhere),
        ctx.db
          .select({
            id: user.id,
            name: user.name,
            image: user.image,
            division: memberProfile.division,
            team: memberProfile.team,
            status: memberProfile.status,
            lastActiveYear: memberProfile.lastActiveYear,
          })
          .from(user)
          .innerJoin(memberProfile, eq(memberProfile.userId, user.id))
          .where(baseWhere)
          .orderBy(user.name)
          .limit(limit)
          .offset(cursor),
      ]);

      const total = totalResult[0]?.value ?? 0;

      return {
        items: rows,
        total,
        nextCursor: cursor + limit < total ? cursor + limit : null,
      };
    }),
});
