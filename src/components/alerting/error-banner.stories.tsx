import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ErrorBanner } from "./error-banner";

const meta = {
  title: "Alerting/ErrorBanner",
  component: ErrorBanner,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Optional title for the error banner",
    },
    message: {
      control: "text",
      description: "The error message to display",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof ErrorBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: "An unexpected error occurred. Please try again.",
  },
};

export const WithCustomTitle: Story = {
  args: {
    title: "Login Failed",
    message: "Invalid credentials. Please check your email and password.",
  },
};

export const AccessDenied: Story = {
  args: {
    title: "Access Denied",
    message: "Access restricted to @q-summit.com emails.",
  },
};

export const LongMessage: Story = {
  args: {
    title: "Network Error",
    message:
      "Unable to connect to the server. Please check your internet connection and try again. If the problem persists, contact support.",
  },
};

export const WithoutTitle: Story = {
  args: {
    message: "This error has no custom title, so it defaults to 'Something went wrong'.",
  },
};

export const WithAnimation: Story = {
  args: {
    title: "Login Failed",
    message: "Access restricted to @q-summit.com emails.",
    className: "animate-in fade-in slide-in-from-top-1",
  },
};
