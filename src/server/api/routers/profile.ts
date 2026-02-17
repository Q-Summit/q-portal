import { ProfileUpdateSchema, normalizeProfileInput } from "@/domain/qsum/profile";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { memberProfile } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const profileRouter = createTRPCRouter({
  getMy: protectedProcedure.query(async ({ ctx }) => {
    return (
      (await ctx.db.query.memberProfile.findFirst({
        where: eq(memberProfile.userId, ctx.session.user.id),
      })) ?? null
    );
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
});
