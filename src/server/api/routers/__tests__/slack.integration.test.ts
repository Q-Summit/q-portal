import { afterEach, beforeEach, describe, expect, it, mock, spyOn, type Mock } from "bun:test";

// Better Auth reads this directly upon import, so we must set it first.
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.BETTER_AUTH_SECRET = "mock-secret-123";

// --- 1. MOCK ENV FIRST (Prevent T3 Env crashes) ---
await mock.module("@/env", () => ({
  env: {
    SLACK_BOT_TOKEN: "xoxb-mock",
    DATABASE_URL: "libsql://mock-db", // Satisfy URL validation
    DATABASE_TOKEN: "mock-token",
  },
}));

// --- 2. MOCK DATABASE (Prevent LibSQL connection crashes) ---
await mock.module("@/server/db", () => ({
  db: {
    query: {},
    insert: () => ({ values: () => Promise.resolve() }),
  },
}));

// --- 3. MOCK SLACK CLIENT ---
// Create the mock function *outside* so we can reference it in tests
type SlackResponse =
  | { ok: true; ts: string; error?: never }
  | { ok: false; error: string; ts?: never };

const mockPostMessage = mock(
  (): Promise<SlackResponse> => Promise.resolve({ ok: true, ts: "1234567890.123456" }),
);

await mock.module("@/server/slack/client", () => ({
  slackClient: {
    chat: {
      postMessage: mockPostMessage,
    },
  },
}));

// --- 4. IMPORTS (Must be dynamic to load AFTER mocks are applied) ---
const { appRouter } = await import("@/server/api/root");
const { createTRPCContext } = await import("@/server/api/trpc");

describe("Slack Router - Integration Tests", () => {
  let consoleErrorSpy: Mock<(...args: unknown[]) => void>;

  beforeEach(() => {
    // Reset call counts and restore default success behavior before every test
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {
      /* empty */
    });
    mockPostMessage.mockClear();
    mockPostMessage.mockResolvedValue({
      ok: true,
      ts: "1234567890.123456",
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should successfully send a message", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.slack.sendMessage({
      channel: "C123ABC456",
      message: "Test message",
    });

    expect(result).toEqual({
      success: true,
      channel: "C123ABC456",
      message: "Test message",
      ts: "1234567890.123456",
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "C123ABC456",
      text: "Test message",
    });
  });

  it("should validate that channel is required", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    // Note: In tRPC, input validation errors usually throw before the resolver runs
    // We expect the promise to reject
    const promise = caller.slack.sendMessage({ channel: "", message: "test" });
    expect(promise).rejects.toThrow("Channel is required");
  });

  it("should validate that message is required", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const promise = caller.slack.sendMessage({ channel: "test", message: "" });
    expect(promise).rejects.toThrow("Message is required");
  });

  it("should handle channel_not_found error from Slack API", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "channel_not_found",
    });

    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "channel_not_found",
    );
  });

  it("should handle not_in_channel error from Slack API", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "not_in_channel",
    });

    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "not_in_channel",
    );
  });

  it("should handle account_inactive error from Slack API", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "account_inactive",
    });

    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "account_inactive",
    );
  });

  it("should handle network errors from Slack API", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const networkError = new Error("Network error");
    mockPostMessage.mockRejectedValue(networkError);

    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      networkError,
    );
  });

  it("should handle unknown Slack API errors", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "unknown_error",
    });

    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "unknown_error",
    );
  });

  it("should pass through helpful error messages from getChannelErrorHelp", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "channel_not_found",
    });

    // We can check strictly against the message content
    const promise = caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" });

    // Checks if the error message contains the helpful hint
    expect(promise).rejects.toThrow("Make sure: 1) Bot is installed");
  });
});
