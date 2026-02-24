import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthLogoBadge } from "./auth-logo-badge";
import { Mountain } from "lucide-react";

const meta = {
  title: "Auth/AuthLogoBadge",
  component: AuthLogoBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthLogoBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Mountain className="h-8 w-8 text-blue-600" />,
  },
};

export const WithIcon: Story = {
  args: {
    children: <span className="text-2xl">🔒</span>,
  },
};

export const WithInitials: Story = {
  args: {
    children: <span className="text-lg font-bold text-blue-600">QS</span>,
  },
};
