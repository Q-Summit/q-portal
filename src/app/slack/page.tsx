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

  const handleSubmit = async (e: React.FormEvent) => {
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
        error:
          error instanceof Error ? error.message : "Failed to send message",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container max-w-2xl px-4 py-16">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 shadow-xl">
          <h1 className="text-4xl font-bold mb-2">Send Slack Message</h1>
          <p className="text-gray-300 mb-6">
            Send a custom message to any Slack channel that bot has access to
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="channel"
                className="block text-sm font-medium mb-2"
              >
                Channel
              </label>
              <input
                id="channel"
                type="text"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="#general or C123ABC456"
                className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                Use channel name (e.g., #general) or channel ID
              </p>
            </div>

            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message..."
                rows={6}
                className="w-full px-4 py-2 rounded bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)] resize-none"
                required
              />
            </div>

            <Button type="submit" disabled={isSending} className="w-full">
              {isSending ? "Sending..." : "Send Message"}
            </Button>
          </form>

          {result?.success && (
            <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded">
              <p className="text-green-300 font-medium">
                ✓ Message sent successfully to {channel}
              </p>
            </div>
          )}

          {result?.error && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded">
              <p className="text-red-300 font-medium">
                ✗ Error: {result.error}
              </p>
              {result.error.includes("channel_not_found") && (
                <p className="text-xs text-red-400 mt-2">
                  💡 Troubleshooting: Invite bot to channel using{" "}
                  <code className="bg-red-500/30 px-1 rounded text-xs">
                    /invite @botname
                  </code>{" "}
                  in Slack
                </p>
              )}
              {result.error.includes("not_authed") && (
                <p className="text-xs text-red-400 mt-2">
                  💡 Troubleshooting: Reinstall app to your workspace and update
                  SLACK_BOT_TOKEN
                </p>
              )}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
            <h3 className="font-semibold mb-2">Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
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
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">
                  chat:write
                </code>
              </li>
              <li>Install app to workspace</li>
              <li>Copy Bot User OAuth Token (starts with xoxb-)</li>
              <li>
                Add token to{" "}
                <code className="bg-white/10 px-1.5 py-0.5 rounded text-sm">
                  SLACK_BOT_TOKEN
                </code>{" "}
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
