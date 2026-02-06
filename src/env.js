import { createEnv } from "@t3-oss/env-nextjs";
import process from "node:process";
import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    // 2. Add Conditional Defaults
    // In test: returns "mock-url", passing validation.
    // In prod/dev: returns "" if missing, failing validation (as desired).
    BETTER_AUTH_URL: z
      .string()
      .url()
      .default(isTest ? "http://localhost:3000" : ""),
    BETTER_AUTH_SECRET: z
      .string()
      .min(1)
      .default(isTest ? "mock-secret-for-testing-only-12345" : ""),
    GOOGLE_CLIENT_ID: z
      .string()
      .min(1)
      .default(isTest ? "mock-google-client-id" : ""),
    GOOGLE_CLIENT_SECRET: z
      .string()
      .min(1)
      .default(isTest ? "mock-google-client-secret" : ""),
    SLACK_BOT_TOKEN: z
      .string()
      .min(1)
      .default(isTest ? "xoxb-mock-token" : ""),

    DATABASE_URL: z.string().url(), // Keep this as required (mocked in tests usually)
    DATABASE_TOKEN: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_BETTER_AUTH_URL: z
      .string()
      .url()
      .default(isTest ? "http://localhost:3000" : ""),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_TOKEN: process.env.DATABASE_TOKEN,
    SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
