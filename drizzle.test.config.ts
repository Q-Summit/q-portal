import { type Config } from "drizzle-kit";

export default {
  schema: "./src/server/db/schema.ts",
  dialect: "turso",
  out: "./src/server/db/_migrations",
  dbCredentials: {
    // For tests, use in-memory database
    // This will be overridden by test utilities
    url: ":memory:",
    authToken: "",
  },
} satisfies Config;

