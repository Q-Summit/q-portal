# Slack Bot Setup Guide

Complete guide to set up Slack integration for the Q-Portal application. This guide covers app creation, permission configuration, and environment setup.

## Overview

This integration enables the Q-Portal application to interact with your Slack workspace. The system allows users to send messages to Slack channels directly from the web interface, while also providing foundations for more advanced interactions like user lookups and command handling.

## Architecture

The integration follows a direct flow from the web interface to Slack's servers:

```mermaid
graph LR
    A[Web UI] -->|HTTP POST| B[tRPC API]
    B -->|sendMessage| C[Slack Web API]
    C --> D[Slack Channel]
```

## Prerequisites

- **Slack Workspace**: An active Slack workspace where you have permissions to create apps.
- **Admin Access**: You may need workspace admin approval to install apps depending on your workspace settings.
- **Node.js 18+**: Ensure your development environment meets the Node.js version requirement for @slack/web-api v7.x (required for Slack SDK v7+).

## Setup Instructions

### 1. Create Slack App

1. Go to [Slack API: Your Apps](https://api.slack.com/apps).
2. Click **"Create New App"**.
3. Choose **"From scratch"**.
4. Enter your **App Name** (e.g., "Q-Portal").
5. Select your **Development Slack Workspace**.
6. Click **"Create App"**.
7. Click **"Install App to Workspace"** (or navigate to OAuth & Permissions if already installed).

### 2. Configure Bot Permissions

Navigate to **OAuth & Permissions** in your Slack app dashboard. Scroll down to the **Scopes** section and add the following **Bot Token Scopes**:

| Permission Scope       | Purpose                                   | Capability Enabled                                                                                  |
| :--------------------- | :---------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| `app_mentions:read`    | View messages that mention the bot        | Allows the bot to listen and respond when users tag @Q-Portal in a channel.                         |
| `channels:read`        | View public channel info                  | Enables the bot to list available public channels and verify channel existence.                     |
| `im:write`             | Send messages as the bot                  | **Required.** allows the bot to post messages to channels it has been invited to.                   |
| `im:write.public`      | Post to any public channel without invite | Enables the bot to post to **any** public channel without needing to be manually invited first.     |
| `chat:write.customize` | Customize bot identity per message        | Allows sending messages with a custom username or avatar (e.g., acting as different system alerts). |
| `commands`             | Add slash commands                        | Enables the creation of shortcuts and slash commands (e.g., `/q-portal status`) for users.          |
| `users:read`           | View people in workspace                  | Enables the bot to look up user details to verify identities or format mentions correctly.          |
| `users:read.email`     | View user email addresses                 | Allows the bot to map Slack users to Q-Portal users via email address.                              |

### 3. Install App to Workspace

1. Scroll up to **"OAuth Tokens for Your Workspace"** section (or click "Install App to Workspace" in sidebar).
2. Click **"Install to Workspace"**.
3. Review the requested permissions.
4. Click **"Allow"**.

### 4. Get Bot User OAuth Token

After installation, you will see a **Bot User OAuth Token** starting with `xoxb-`.

1. Copy the **Bot User OAuth Token**.
2. You will need this for the configuration step below.

### 5. Invite Bot to Channel (Optional)

If you did not enable `chat:write.public`, you must manually invite the bot to any channel where you want it to post:

1. Go to the Slack channel.
2. Type `/invite @Q-Portal` (or your app's name).
3. Press Enter to add the bot.

## Configuration

To connect Q-Portal to your Slack app, you need to configure the following environment variable.

1. Open your `.env` file in the project root.
2. Add or update the `SLACK_BOT_TOKEN` variable:

```bash
# .env
SLACK_BOT_TOKEN=xoxb-your-bot-user-oauth-token
```

> **Security Warning**: Never commit your `.env` file to version control. Ensure it is listed in your `.gitignore` file. Also, for production deployments, consider using a secret manager (e.g., Vercel Environment Variables, AWS Secrets Manager) instead of `.env` files.

> **Security Warning**: Never commit your `.env` file to version control. Ensure it is listed in your `.gitignore` file.

## Capabilities

The current implementation provides basic messaging functionality:

### Messaging

- **Public & Private Channels**: Send formatted messages to any channel that bot is a member of (`chat:write`).
- **Direct Messages**: Send private notifications directly to users (`im:write`).

### Future Enhancements (Planned)

The following advanced features are planned for future releases:

### User Management

- **User Lookup**: Resolve Slack IDs to real names and profiles (`users:read`).
- **Identity Mapping**: Link Slack accounts to Q-Portal users via email addresses (`users:read.email`).

### Interactivity

- **Mentions**: Trigger actions when users mention @Q-Portal (`app_mentions:read`).
- **Slash Commands**: Execute defined actions via command shortcuts (`commands`).

## Troubleshooting

### "channel_not_found" Error

**Cause**: The bot attempts to post to a private channel it hasn't been invited to, or a public channel (if `chat:write.public` is missing).
**Solution**:

- Invite the bot to the channel: `/invite @Q-Portal`.
- Ensure the channel ID or name is correct.

### "not_authed" Error

**Cause**: The `SLACK_BOT_TOKEN` is missing, invalid, or belongs to a different workspace.
**Solution**:

- Check your `.env` file.
- Reinstall the app in the Slack dashboard to generate a new token.

### "missing_scope" Error

**Cause**: The app tries to perform an action (like sending a DM) without the required permission scope.
**Solution**:

- Go to **OAuth & Permissions** in Slack.
- Add the missing scope (e.g., `im:write`).
- **Reinstall the app** to apply the new permissions.
