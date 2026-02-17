import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  // Use NEXT_PUBLIC_ prefix so this env var is available in client-side code
  // Falls back to empty string (relative URL) if not set
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "",
});
