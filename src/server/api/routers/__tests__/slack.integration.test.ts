/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { slackClient } from "@/server/slack/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "bun:test";

describe("Slack Router - Integration Tests", () => {
  // Store original chat to restore it later
  const originalChat = slackClient.chat;
  const mockPostMessage = vi.fn();

  beforeEach(() => {
    // Replace the chat method with our mock

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

    (slackClient as any).chat = originalChat;
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

    expect(caller.slack.sendMessage({ channel: "", message: "test" })).rejects.toThrow(
      "Channel is required",
    );
  });

  it("should validate that message is required", async () => {
    const ctx = await createTRPCContext({ headers: new Headers() });
    const caller = appRouter.createCaller(ctx);

    expect(caller.slack.sendMessage({ channel: "test", message: "" })).rejects.toThrow(
      "Message is required",
    );
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

    // Test for the raw error code
    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "channel_not_found",
    );

    // Test for the helpful message part
    expect(caller.slack.sendMessage({ channel: "C123ABC456", message: "Test" })).rejects.toThrow(
      "Make sure: 1) Bot is installed in your workspace, 2) Bot is invited to the channel using /invite @botname",
    );
  });
});
