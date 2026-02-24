import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthShell } from "./auth-shell";
import { Button } from "@/components/ui/button";

const meta = {
  title: "Auth/AuthShell",
  component: AuthShell,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="rounded-xl border bg-card p-8 shadow-lg">
        <p className="text-muted-foreground">Content centered in auth shell</p>
      </div>
    ),
  },
};

export const WithAuthCard: Story = {
  args: {
    children: (
      <div className="w-full max-w-[420px] rounded-xl border bg-card p-8 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-bold">Welcome</h2>
        <p className="mb-6 text-center text-muted-foreground">Sign in to continue</p>
        <Button className="w-full">Sign In</Button>
      </div>
    ),
  },
};

export const WithMultipleElements: Story = {
  args: {
    children: (
      <div className="flex w-full max-w-4xl gap-8">
        <div className="flex-1 rounded-xl border bg-card p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Left Panel</h2>
          <p className="text-muted-foreground">Additional content</p>
        </div>
        <div className="flex-1 rounded-xl border bg-card p-8 shadow-lg">
          <h2 className="mb-4 text-xl font-semibold">Right Panel</h2>
          <p className="text-muted-foreground">More content</p>
        </div>
      </div>
    ),
  },
};
