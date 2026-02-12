import { describe, expect, it } from "bun:test";

import { isValidRedirectPath, safeDecodeURIComponent } from "@/lib/utils";

describe("safeDecodeURIComponent", () => {
  it("returns decoded string for valid encoded input", () => {
    expect(safeDecodeURIComponent("%2Fdashboard%3Ftab%3Doverview")).toBe("/dashboard?tab=overview");
  });

  it("returns null for malformed URI sequences", () => {
    expect(safeDecodeURIComponent("%E0%A4%A")).toBeNull();
  });

  it("returns null for incomplete percent encoding", () => {
    expect(safeDecodeURIComponent("/dashboard?tab=%")).toBeNull();
    expect(safeDecodeURIComponent("/dashboard?tab=%2")).toBeNull();
  });
});

describe("isValidRedirectPath", () => {
  it("returns true for valid relative paths", () => {
    expect(isValidRedirectPath("/dashboard")).toBeTrue();
    expect(isValidRedirectPath("/dashboard?tab=overview")).toBeTrue();
  });

  it("returns false for null, undefined, and empty paths", () => {
    expect(isValidRedirectPath(null)).toBeFalse();
    expect(isValidRedirectPath(undefined)).toBeFalse();
    expect(isValidRedirectPath("")).toBeFalse();
  });

  it("returns false for protocol-relative URLs", () => {
    expect(isValidRedirectPath("//evil.com")).toBeFalse();
  });

  it("returns false for absolute URLs", () => {
    expect(isValidRedirectPath("https://evil.com")).toBeFalse();
  });

  it("returns false for paths containing ://", () => {
    expect(isValidRedirectPath("/dashboard/https://evil.com")).toBeFalse();
  });
});

describe("domain restriction normalization behavior", () => {
  const normalizeEmailForDomainCheck = (email: string) => email.trim().toLowerCase();
  const isAllowedQSummitEmail = (email: string) =>
    normalizeEmailForDomainCheck(email).endsWith("@q-summit.com");

  it("normalizes case before domain checks", () => {
    expect(isAllowedQSummitEmail("USER@Q-SUMMIT.COM")).toBeTrue();
    expect(isAllowedQSummitEmail("User@Q-SuMmIt.CoM")).toBeTrue();
  });

  it("normalizes surrounding whitespace before domain checks", () => {
    expect(isAllowedQSummitEmail("  user@q-summit.com  ")).toBeTrue();
  });

  it("still rejects non q-summit domains after normalization", () => {
    expect(isAllowedQSummitEmail("user@evil.com")).toBeFalse();
    expect(isAllowedQSummitEmail("user@q-summit.com.evil.com")).toBeFalse();
  });
});
