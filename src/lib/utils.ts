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
