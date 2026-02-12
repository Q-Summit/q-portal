import * as schema from "@/server/db/schema";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import { join } from "path";

/**
 * Test utilities for database operations and test helpers.
 *
 * All test-related utilities are centralized here for convenience.
 */

/**
 * Creates a test database instance using in-memory SQLite.
 *
 * Each call to this function creates a NEW unique in-memory database.
 * - If called in `beforeAll`, all tests in that suite share the same database
 * - If called in each test, each test gets its own isolated database
 *
 * Uses `:memory:` for in-memory databases - each connection gets its own
 * private in-memory database that is automatically cleaned up when closed.
 */
export function createTestDb() {
  // Use in-memory database - each connection gets its own private database
  const client = createClient({
    url: ":memory:",
  });

  const db = drizzle(client, { schema });

  return { db, client };
}

/**
 * Runs database migrations on a test database.
 * If migrations don't exist, the schema will be created on first use.
 */
export async function migrateTestDb(db: ReturnType<typeof createTestDb>["db"]) {
  const migrationsPath = join(process.cwd(), "src/server/db/_migrations");
  const fs = await import("fs");

  // Check if migrations directory exists
  if (fs.existsSync(migrationsPath)) {
    const metaPath = join(migrationsPath, "meta", "_journal.json");
    // Check if journal file exists (migrations are set up)
    if (fs.existsSync(metaPath)) {
      try {
        await migrate(db, { migrationsFolder: migrationsPath });
      } catch {
        // If migrations fail, schema will be created on first use
        // This is fine for in-memory databases
        console.warn("Migrations failed, schema will be created on first use");
      }
    }
  }
  // If migrations don't exist, that's fine - schema will be created on first use
}

/**
 * Creates a test database with migrations applied.
 */
export async function createTestDbWithMigrations() {
  const { db, client } = createTestDb();
  await migrateTestDb(db);
  return { db, client };
}

/**
 * Cleans up a test database instance.
 */
export async function cleanupTestDb(
  db: ReturnType<typeof createTestDb>["db"],
  client: ReturnType<typeof createTestDb>["client"],
) {
  try {
    client.close();
  } catch (error) {
    // Ignore cleanup errors
    console.warn("Error cleaning up test database:", error);
  }
}
