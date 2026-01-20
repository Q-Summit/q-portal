# Login Flow & Authentication Documentation

## 1. Overview

This project uses **Better Auth** combined with **Google OAuth 2.0** to handle authentication. We enforce a strict **Domain Restriction Policy** at the database level to ensure only organizational users can access the application.

- **Strategy:** Google OAuth (Social Sign-in)
- **Restriction:** Only emails ending in `@q-summit.com` are allowed.
- **Session Management:** Database-backed sessions (SQLite/Turso via Drizzle ORM).

---

## 2. Architecture & Flow

1.  **User Action:** User clicks "Sign in with Google" on `/login`.
2.  **Redirect:** App redirects to Google's OAuth consent screen.
3.  **Validation (Google Side):** Google verifies the user's credentials.
4.  **Callback:** Google redirects back to `/api/auth/callback/google` with an authorization code.
5.  **Hook & Security Check (Server Side):**
    - Better Auth attempts to create the user in the database.
    - **The Hook:** A `before` hook in `auth.ts` checks if `email.endsWith("@q-summit.com")`.
    - **Pass:** User is created/updated, session is generated.
    - **Fail:** Database write is blocked, error `ACCESS_DENIED` is thrown.
6.  **Final Routing:**
    - **Success:** User is redirected to `/dashboard`.
    - **Failure:** User is redirected back to `/login?error=ACCESS_DENIED` where the error is handled.

---

## 3. Google Cloud Configuration

To manage the OAuth credentials, access the [Google Cloud Console](https://console.cloud.google.com/).

### Project: `q-summit-dev` (or Production equivalent `q-summit-prod`)

**1. OAuth Consent Screen**

- **User Type:** `Internal` (Allows all users in the Google Workspace organization).
- **Scopes:** `.../auth/userinfo.email`, `.../auth/userinfo.profile` (Defaults).

**2. Credentials (OAuth 2.0 Client ID)**

- **Authorized JavaScript Origins:**
  - Dev: `http://localhost:3000`
  - Prod: `https://tbd.com`
- **Authorized Redirect URIs:**
  - Dev: `http://localhost:3000/api/auth/callback/google`
  - Prod: `https://tbd.com/api/auth/callback/google`

> **Note:** If you don't have access to these projects, reach out to Kevin or Johannes.

---

## 4. Codebase Map

### Configuration & Logic

- **`src/lib/auth.ts`**
  - Main configuration file.
  - Connects to Drizzle (`db`).
  - **Contains the Domain Restriction Hook:** Look for `databaseHooks.user.create`.
- **`src/lib/auth-client.ts`**
  - Exports the type-safe client used by components.
  - Uses `NEXT_PUBLIC_BETTER_AUTH_URL` env var for the base URL.
  - The `NEXT_PUBLIC_` prefix is required for Next.js client-side access.

### API Route

- **`src/app/api/auth/[...all]/route.ts`**
  - The single endpoint that handles all auth requests (login, logout, callback, session).

### Database Schema

- **`src/server/db/schema.ts`**
  - Contains the `user`, `session`, `account`, and `verification` tables required by Better Auth.

### UI Components

- **`src/app/login/page.tsx`**
  - The visual login card (shadcn/ui).
  - Handles the `signIn.social` call.
  - Reads `?error=` params from the URL to display "Access Denied" messages.

---

## 5. Environment Variables

Ensure these are present in `.env`:

```bash
# Generated via bunx auth secret
BETTER_AUTH_SECRET="your-generated-secret-with-atleast-32-chars"

# From Google Cloud Console -> Credentials
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# The base URL of your application (server-side)
BETTER_AUTH_URL="http://localhost:3000"

# Same URL but exposed to the browser (client-side auth operations)
# Must use NEXT_PUBLIC_ prefix for Next.js client-side access
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```
