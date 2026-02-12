/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { afterEach, beforeEach, describe, expect, it, Mock, mock, spyOn } from "bun:test";

// --- 1. SETUP MOCKS BEFORE IMPORTS ---

// A. Mock the Environment to bypass T3 Env security checks
// This MUST run before "../client" is imported
await mock.module("@/env", () => ({
  env: {
    SLACK_BOT_TOKEN: "xoxb-mock-token",
  },
}));

// B. Mock the Slack Web API module
// This ensures the class instantiation in client.ts uses our safe mock
await mock.module("@slack/web-api", () => {
  return {
    WebClient: class {
      // Provide a default structure so 'new WebClient()' succeeds
      chat = {
        postMessage: mock(() => Promise.resolve({ ok: true, ts: "default" })),
      };
    },
  };
});

// --- 2. IMPORT MODULE UNDER TEST ---
// We use dynamic import here so it loads AFTER the mocks are applied
const { sendSlackMessage, slackClient } = await import("../client");

// --- 3. TEST SUITE ---
describe("Slack Client Unit Tests", () => {
  // Store original chat object (from our class mock) to restore later
  let consoleErrorSpy: Mock<(...args: unknown[]) => void>;
  const originalChat = slackClient.chat;
  let mockPostMessage: ReturnType<typeof mock>;

  beforeEach(() => {
    // Create a fresh mock for every test case
    consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {
      /* empty */
    });
    mockPostMessage = mock(() =>
      Promise.resolve({
        ok: true,
        ts: "1234567890.123456",
      }),
    );

    // Patch the client instance with our fresh mock
    (slackClient as any).chat = {
      postMessage: mockPostMessage,
    };
  });

  afterEach(() => {
    // Restore the original state
    consoleErrorSpy.mockRestore();
    (slackClient as any).chat = originalChat;
  });

  describe("sendSlackMessage", () => {
    it("should successfully send a message", async () => {
      const result = await sendSlackMessage("C123ABC456", "Test message");

      expect(mockPostMessage).toHaveBeenCalledWith({
        channel: "C123ABC456",
        text: "Test message",
      });
      expect(result).toEqual({
        ok: true,
        ts: "1234567890.123456",
      });
    });

    it("should throw error when Slack API returns channel_not_found", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "channel_not_found",
      });

      expect(sendSlackMessage("C123ABC456", "Test message")).rejects.toThrow("channel_not_found");
    });

    it("should throw error when Slack API returns not_in_channel", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "not_in_channel",
      });

      expect(sendSlackMessage("C123ABC456", "Test message")).rejects.toThrow("not_in_channel");
    });

    it("should throw error when Slack API returns account_inactive", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "account_inactive",
      });

      expect(sendSlackMessage("C123ABC456", "Test message")).rejects.toThrow("account_inactive");
    });

    it("should throw error when Slack API returns unknown_error", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "unknown_error",
      });

      expect(sendSlackMessage("C123ABC456", "Test message")).rejects.toThrow("unknown_error");
    });

    it("should throw error when Slack API call fails", async () => {
      const networkError = new Error("Network error");
      mockPostMessage.mockRejectedValue(networkError);

      expect(sendSlackMessage("C123ABC456", "Test message")).rejects.toThrow(networkError);
    });

    it("should log success message to console", async () => {
      const consoleLogSpy = spyOn(console, "log").mockImplementation(() => {
        /* empty */
      });

      await sendSlackMessage("C123ABC456", "Test message");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Message sent successfully to channel C123ABC456: 1234567890.123456",
      );

      consoleLogSpy.mockRestore();
    });

    it("should log error message to console on failure", async () => {
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {
        /* empty */
      });

      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "channel_not_found",
      });

      try {
        await sendSlackMessage("C123ABC456", "Test message");
      } catch (error) {
        expect(String(error)).toContain("channel_not_found");
      }

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
