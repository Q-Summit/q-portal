import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * specific checks to prevent Open Redirect vulnerabilities.
 * 1. Must start with "/"
 * 2. Must NOT start with "//" (protocol-relative URLs)
 * 3. Must NOT contain "://" (absolute URLs)
 */
export function isValidRedirectPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("://");
}

/**
 * Safely decode a URI component, returning null on malformed input.
 */
export function safeDecodeURIComponent(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Resolve a callbackUrl from searchParams, with safe decoding and validation.
 * Returns the fallback path if the callback is invalid or missing.
 */
export function resolveCallbackUrl(
  rawCallbackUrl: string | undefined,
  fallback = "/dashboard",
): string {
  if (!rawCallbackUrl) return fallback;

  const decoded = safeDecodeURIComponent(rawCallbackUrl);
  if (decoded && isValidRedirectPath(decoded)) {
    return decoded;
  }

  return fallback;
}

/**
 * Build a /login URL that preserves the intended destination.
 * Used in server components when redirecting unauthenticated users.
 */
export function buildLoginRedirect(currentPath: string): string {
  if (isValidRedirectPath(currentPath)) {
    return `/login?callbackUrl=${encodeURIComponent(currentPath)}`;
  }
  return "/login";
}
