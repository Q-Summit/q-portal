import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { sendSlackMessage } from "@/server/slack/client";

export const slackRouter = createTRPCRouter({
  sendMessage: publicProcedure
    .input(
      z.object({
        channel: z.string().min(1, "Channel is required"),
        message: z.string().min(1, "Message is required"),
      }),
    )
    .mutation(async ({ input }) => {
      const { channel, message } = input;

      try {
        const slackResponse = await sendSlackMessage(channel, message);

        return {
          success: true,
          channel,
          message,
          ts: slackResponse?.ts,
        };
      } catch (error) {
        console.error("Slack API Error:", error);

        const msg = error instanceof Error ? error.message : "Unknown error";

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: msg,
          cause: error,
        });
      }
    }),
});
