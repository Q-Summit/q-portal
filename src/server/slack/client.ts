import { env } from "@/env";
import { WebClient } from "@slack/web-api";

/**
 * Singleton Slack Web API client instance
 *
 * This client is used to send messages to Slack channels via the Web API.
 * Ensure that bot is installed in your workspace and has the required scopes:
 * - chat:write (required for posting messages)
 * - channels:read (optional, for looking up channels by name)
 *
 * Get your Bot User OAuth Token from: https://api.slack.com/apps
 */
export const slackClient = new WebClient(env.SLACK_BOT_TOKEN);

/**
 * Send a message to a Slack channel
 *
 * @param channel - Channel ID (e.g., "C123ABC456") or name (e.g., "#general")
 * @param text - The message text to send
 * @returns Promise with the result of the message send operation
 */
export async function sendSlackMessage(channel: string, text: string) {
  try {
    console.log(`Attempting to send message to channel: ${channel}`);

    const result = await slackClient.chat.postMessage({
      channel,
      text,
    });

    if (!result.ok) {
      const errorMsg = result.error ?? "Unknown error";
      console.error(`Slack API error for channel "${channel}":`, errorMsg);

      const helpfulMessage = getChannelErrorHelp(result.error ?? "");
      throw new Error(`${errorMsg}${helpfulMessage ? ` (${helpfulMessage})` : ""}`);
    }

    console.log(`Message sent successfully to channel ${channel}: ${result.ts}`);
    return result;
  } catch (error) {
    console.error("Failed to send Slack message:", error);
    throw error;
  }
}

function getChannelErrorHelp(error: string): string {
  const helpMessages: Record<string, string> = {
    channel_not_found:
      "Make sure: 1) Bot is installed in your workspace, 2) Bot is invited to the channel using /invite @botname",
    not_in_channel:
      "Bot must be a member of the channel to send messages. Invite the bot to the channel.",
    account_inactive: "The bot's account is inactive. Check your Slack app settings.",
  };

  return helpMessages[error] || "Check Slack app permissions and bot installation.";
}
