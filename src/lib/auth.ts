import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { APIError } from "better-auth/api";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // 🔒 SECURITY: Enforce domain restriction
          if (!user.email.endsWith("@q-summit.com")) {
            throw new APIError("FORBIDDEN", {
              message:
                "Access is restricted to @q-summit.com email addresses only.",
            });
          }
          return { data: user };
        },
      },
    },
  },
});
