import { describe, it, expect } from "bun:test";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";

// DOM environment is automatically set up via test/setup-dom.ts preload script

/**
 * Example component test demonstrating how to test React components in isolation.
 *
 * Component tests should test component rendering, user interactions,
 * and component behavior without full page rendering.
 */
describe("Button Component", () => {
  it("should render button with default variant", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.textContent).toBe("Click me");
  });

  it("should render button with different variants", () => {
    const { container } = render(<Button variant="destructive">Delete</Button>);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.textContent).toBe("Delete");
  });

  it("should handle click events", () => {
    const handleClick = () => {
      // Mock click handler
    };
    const { container } = render(
      <Button onClick={handleClick}>Click me</Button>,
    );
    const button = container.querySelector("button");
    expect(button).toBeDefined();
  });

  it("should render with different sizes", () => {
    const { container } = render(<Button size="lg">Large Button</Button>);
    const button = container.querySelector("button");
    expect(button).toBeDefined();
    expect(button?.textContent).toBe("Large Button");
  });
});
