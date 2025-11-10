import { describe, it, expect } from "bun:test";

/**
 * Example unit test demonstrating how to test pure functions without database.
 *
 * Unit tests should test individual functions or modules in isolation,
 * without external dependencies like databases or network calls.
 */
describe("Example Unit Tests", () => {
  it("should perform basic calculations", () => {
    const add = (a: number, b: number) => a + b;
    expect(add(2, 3)).toBe(5);
  });

  it("should format strings correctly", () => {
    const formatGreeting = (name: string) => `Hello ${name}!`;
    expect(formatGreeting("World")).toBe("Hello World!");
  });

  it("should validate input", () => {
    const isValidEmail = (email: string) => {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };
    expect(isValidEmail("test@example.com")).toBe(true);
    expect(isValidEmail("invalid-email")).toBe(false);
  });
});
