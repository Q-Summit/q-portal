import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import { createTRPCContext } from "@/server/api/trpc";
import { appRouter } from "@/server/api/root";
import { slackClient } from "@/server/slack/client";

describe("Slack Router - Integration Tests", () => {
  // Store original chat to restore it later
  const originalChat = slackClient.chat;
  const mockPostMessage = vi.fn();

  beforeEach(() => {
    // Replace the chat method with our mock
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (slackClient as any).chat = {
      postMessage: mockPostMessage,
    };

    vi.clearAllMocks();
    // Set up mock to return successful response by default
    mockPostMessage.mockResolvedValue({
      ok: true,
      ts: "1234567890.123456",
    });
  });

  afterEach(() => {
    // Restore original chat
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (slackClient as any).chat = originalChat;
  });

  it("should successfully send a message", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const result = await caller.slack.sendMessage({
      channel: "C123ABC456",
      message: "Test message",
    });

    expect(result).toEqual({
      success: true,
      channel: "C123ABC456",
      message: "Test message",
    });

    expect(mockPostMessage).toHaveBeenCalledWith({
      channel: "C123ABC456",
      text: "Test message",
    });
  });

  it("should validate that channel is required", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.slack.sendMessage({ channel: "", message: "test" }),
    ).rejects.toThrow("Channel is required");
  });

  it("should validate that message is required", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.slack.sendMessage({ channel: "test", message: "" }),
    ).rejects.toThrow("Message is required");
  });

  it("should handle channel_not_found error from Slack API", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "channel_not_found",
    });

    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow("channel_not_found");
  });

  it("should handle not_in_channel error from Slack API", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "not_in_channel",
    });

    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow("not_in_channel");
  });

  it("should handle account_inactive error from Slack API", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "account_inactive",
    });

    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow("account_inactive");
  });

  it("should handle network errors from Slack API", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    const networkError = new Error("Network error");
    mockPostMessage.mockRejectedValue(networkError);

    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow(networkError);
  });

  it("should handle unknown Slack API errors", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "unknown_error",
    });

    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow("unknown_error");
  });

  it("should pass through helpful error messages from getChannelErrorHelp", async () => {
    const ctx = createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    mockPostMessage.mockResolvedValue({
      ok: false,
      error: "channel_not_found",
    });

    // Test for the raw error code
    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow("channel_not_found");

    // Test for the helpful message part
    await expect(
      caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" }),
    ).rejects.toThrow(
      "Make sure: 1) Bot is installed in your workspace, 2) Bot is invited to the channel using /invite @botname",
    );
  });
});
