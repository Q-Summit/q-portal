import { describe, it, expect } from "bun:test";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";

/**
 * Example integration test demonstrating how to test tRPC routers.
 *
 * Integration tests should test interactions between components.
 * This example doesn't require a database, but shows the pattern for tests that do.
 */
describe("Example Router - Integration Tests", () => {
  it("should call example.hello procedure", async () => {
    // Create tRPC caller with test context
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    // Call the procedure
    const result = await caller.example.hello({ text: "World" });

    expect(result).toEqual({
      greeting: "Hello World!",
    });
  });

  it("should handle different input texts", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.example.hello({ text: "Q Portal" });

    expect(result).toEqual({
      greeting: "Hello Q Portal!",
    });
  });

  // Example with database (uncomment when you have database operations to test):
  // it("should test database operations", async () => {
  //   const { db, client } = await createTestDbWithMigrations();
  //   try {
  //     // Test database operations here
  //   } finally {
  //     await cleanupTestDb(db, client);
  //   }
  // });
});
