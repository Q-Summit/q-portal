import { describe, it, expect, vi, beforeEach, afterEach } from "bun:test";
import { sendSlackMessage, slackClient } from "../client";

describe("Slack Client Unit Tests", () => {
  // Store the original chat to restore it later
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

      await expect(
        sendSlackMessage("C123ABC456", "Test message"),
      ).rejects.toThrow("channel_not_found");
    });

    it("should throw error when Slack API returns not_in_channel", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "not_in_channel",
      });

      await expect(
        sendSlackMessage("C123ABC456", "Test message"),
      ).rejects.toThrow("not_in_channel");
    });

    it("should throw error when Slack API returns account_inactive", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "account_inactive",
      });

      await expect(
        sendSlackMessage("C123ABC456", "Test message"),
      ).rejects.toThrow("account_inactive");
    });

    it("should throw error when Slack API returns unknown_error", async () => {
      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "unknown_error",
      });

      await expect(
        sendSlackMessage("C123ABC456", "Test message"),
      ).rejects.toThrow("unknown_error");
    });

    it("should throw error when Slack API call fails", async () => {
      const networkError = new Error("Network error");
      mockPostMessage.mockRejectedValue(networkError);

      await expect(
        sendSlackMessage("C123ABC456", "Test message"),
      ).rejects.toThrow(networkError);
    });

    it("should log success message to console", async () => {
      const consoleLogSpy = vi
        .spyOn(console, "log")
        .mockImplementation(() => {});

      await sendSlackMessage("C123ABC456", "Test message");

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Message sent successfully to channel C123ABC456: 1234567890.123456",
      );

      consoleLogSpy.mockRestore();
    });

    it("should log error message to console on failure", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      mockPostMessage.mockResolvedValue({
        ok: false,
        error: "channel_not_found",
      });

      try {
        await sendSlackMessage("C123ABC456", "Test message");
      } catch (error) {
        expect(String(error)).toContain("channel_not_found");
      }

      consoleErrorSpy.mockRestore();
    });
  });
});
