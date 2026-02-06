"use client";

import { useState } from "react";
import { api } from "@/server/api/client";
import { Button } from "@/components/ui/button";

export default function SlackMessagePage() {
  const [channel, setChannel] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);
  const sendMessage = api.slack.sendMessage.useMutation();

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!channel || !message) return;

    setIsSending(true);
    setResult(null);

    try {
      await sendMessage.mutateAsync({ channel, message });
      setResult({ success: true });
      setMessage("");
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Failed to send message",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container max-w-2xl px-4 py-16">
        <div className="rounded-lg bg-white/10 p-8 shadow-xl backdrop-blur-lg">
          <h1 className="mb-2 text-4xl font-bold">Send Slack Message</h1>
          <p className="mb-6 text-gray-300">
            Send a custom message to any Slack channel that bot has access to
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="channel" className="mb-2 block text-sm font-medium">
                Channel
              </label>
              <input
                id="channel"
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="#general or C123ABC456"
                className="w-full rounded border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                required
              />
              <p className="mt-1 text-xs text-gray-400">
                Use channel name (e.g., #general) or channel ID
              </p>
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium">
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={6}
                className="w-full resize-none rounded border border-white/20 bg-white/10 px-4 py-2 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                required
              />
            </div>

            <Button type="submit" disabled={isSending} className="w-full">
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </form>

          {result?.success && (
            <div className="mt-4 rounded border border-green-500/50 bg-green-500/20 p-4">
              <p className="font-medium text-green-300">✓ Message sent successfully to {channel}</p>
            </div>
          )}

          {result?.error && (
            <div className="mt-4 rounded border border-red-500/50 bg-red-500/20 p-4">
              <p className="font-medium text-red-300">✗ Error: {result.error}</p>
              {result.error.includes("channel_not_found") && (
                <p className="mt-2 text-xs text-red-400">
                  💡 Troubleshooting: Invite bot to channel using{" "}
                  <code className="rounded bg-red-500/30 px-1 text-xs">/invite @botname</code> in
                  Slack
                </p>
              )}
              {result.error.includes("not_authed") && (
                <p className="mt-2 text-xs text-red-400">
                  💡 Troubleshooting: Reinstall app to your workspace and update SLACK_BOT_TOKEN
                </p>
              )}
            </div>
          )}

          <div className="mt-6 rounded border border-blue-500/30 bg-blue-500/10 p-4">
            <h3 className="mb-2 font-semibold">Setup Instructions:</h3>
            <ol className="list-inside list-decimal space-y-1 text-sm text-gray-300">
              <li>
                Create a Slack App at{" "}
                <a
                  href="https://api.slack.com/apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[hsl(280,100%,70%)] hover:underline"
                >
                  api.slack.com/apps
                </a>
              </li>
              <li>
                Add Bot Token Scopes:{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">chat:write</code>
              </li>
              <li>Install app to workspace</li>
              <li>Copy Bot User OAuth Token (starts with xoxb-)</li>
              <li>
                Add token to{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">SLACK_BOT_TOKEN</code>{" "}
                in .env file
              </li>
              <li>Invite bot to channels you want to message</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
