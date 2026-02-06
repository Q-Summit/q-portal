# Login Flow & Authentication Documentation

## 1. Overview

This project uses **Better Auth** combined with **Google OAuth 2.0** to handle authentication. We enforce a strict **Domain Restriction Policy** at the database level to ensure only organizational users can access the application.

- **Strategy:** Google OAuth (Social Sign-in)
- **Restriction:** Only emails ending in `@q-summit.com` are allowed.
- **Session Management:** Database-backed sessions (SQLite/Turso via Drizzle ORM).
- **Profile Requirement:** Users must complete their profile (Division/Team) before accessing the dashboard.

---

## 2. Architecture & Flow

The authentication process follows a multi-stage pipeline: Login → OAuth → Database Check → Profile Gate → Final Destination.

Detailed Step-by-Step

    1. User Entry:
        - User attempts to visit a protected page (e.g., /dashboard?tab=settings).
        - Middleware intercepts the request, saves the path as a callbackUrl, and redirects to /login.
        -
    2. Authentication:
        - User clicks "Sign in with Google".
        - App initiates OAuth flow, passing callbackUrl to the Google configuration.
        - Google Hook (Server): Better Auth attempts to create the user. A before hook blocks any email not ending in @q-summit.com.

    3. Post-Auth Routing (/post-auth):
        - Upon success, Google redirects the user to our interstitial page: /post-auth?next=....
        - Server Check: We query the member_profile table.
          - If Profile Incomplete: Redirect to /complete-profile.
          - If Profile Complete: Redirect immediately to the next destination (or /dashboard).

    4. Profile Completion (/complete-profile):
        - User fills out mandatory fields (Division, Team).
        - Upon submission, the profile is marked isProfileComplete: true.
        - User is finally redirected to their original destination.

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

### Core Logic

- `src/lib/auth.ts`
  - Main server-side config. Defines the user, session, account schema adapters.
  - Security Hook: Contains the databaseHooks.user.create that enforces @q-summit.com emails.
- `src/middleware.ts`
  - Protects routes globally.
  - Smart Redirects: Captures current path + query params into callbackUrl before kicking users to login.
  - API Protection: Returns 401 JSON (instead of 307 Redirects) for unauthorized API calls.

### Route Handlers & Pages

- `src/app/(auth)/login/page.tsx`
  - Client-side login form. Handles error states (e.g., ACCESS_DENIED) and initiates the Google flow.

- `src/app/(auth)/post-auth/page.tsx`
  - The Traffic Controller. An invisible server component that decides if a user goes to Dashboard or Profile Completion.

- `src/app/(auth)/complete-profile/page.tsx`
  - The form for new users to select their Division and Team.

### Database Schema (`src/server/db/schema.ts`)

- Auth Tables: `user`, `session`, `account`, `verification` (Standard Better Auth).
- Business Tables: `member_profile` (Linked to `user.id` via Foreign Key).
  - Constraint: `onDelete: "cascade"` ensures deleting a User removes their Profile/Session.

---

## 5. Environment Variables

We use `@t3-oss/env-nextjs` for strict validation in `src/env.js`.

```bash
# Security & Database
BETTER_AUTH_SECRET="[generated-32-char-secret]"
TURSO_CONNECTION_URL="libsql://..."
TURSO_AUTH_TOKEN="..."

# Google OAuth (Server-Side)
GOOGLE_CLIENT_ID="xxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="xxx"

# App URLs
# Used by Better Auth server-side to construct callback URLs
BETTER_AUTH_URL="http://localhost:3000"

# Used by client-side components (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_BETTER_AUTH_URL="http://localhost:3000"
```
