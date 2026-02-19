import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AuthScrollableCard } from "./auth-scrollable-card";
import { Button } from "@/components/ui/button";
import { ErrorBanner } from "@/components/alerting/error-banner";

const meta = {
  title: "Auth/AuthScrollableCard",
  component: AuthScrollableCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "Title displayed in the card header",
    },
    description: {
      control: "text",
      description: "Optional description below the title",
    },
    height: {
      control: "text",
      description: "Height of the card (default: h-[80vh])",
    },
    contentClassName: {
      control: "text",
      description: "Classes for the content area",
    },
  },
} satisfies Meta<typeof AuthScrollableCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Welcome back",
    description: "Login to Q-Summit's Internal Hub",
    height: "h-[50vh]",
    children: (
      <Button size="lg" className="h-12 w-full rounded-xl">
        Sign in with Google
      </Button>
    ),
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Complete Your Profile",
    height: "h-[60vh]",
    children: (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground">Tell us a bit about yourself</p>
        <Button className="w-full">Continue</Button>
      </div>
    ),
  },
};

export const WithCustomFooter: Story = {
  args: {
    title: "Welcome back",
    description: "Login to Q-Summit's Internal Hub",
    height: "h-[50vh]",
    footer: (
      <div className="flex w-full justify-between text-xs text-muted-foreground">
        <a href="#" className="transition-colors hover:text-foreground">
          Privacy Policy
        </a>
        <a href="#" className="transition-colors hover:text-foreground">
          Support
        </a>
      </div>
    ),
    children: (
      <Button size="lg" className="h-12 w-full rounded-xl">
        Sign in with Google
      </Button>
    ),
  },
};

export const WithError: Story = {
  args: {
    title: "Welcome back",
    description: "Login to Q-Summit's Internal Hub",
    height: "h-[55vh]",
    children: (
      <div className="flex flex-col gap-4">
        <ErrorBanner
          title="Login Failed"
          message="Access restricted to @q-summit.com emails."
          className="animate-in fade-in slide-in-from-top-1"
        />
        <Button size="lg" className="h-12 w-full rounded-xl">
          Sign in with Google
        </Button>
      </div>
    ),
  },
};

export const WithInfoBox: Story = {
  args: {
    title: "Welcome back",
    description: "Login to Q-Summit's Internal Hub",
    height: "h-[60vh]",
    contentClassName: "justify-center gap-6",
    children: (
      <div className="flex flex-col gap-4">
        <Button size="lg" className="h-12 w-full rounded-xl">
          Sign in with Google
        </Button>
        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <span className="text-primary/70">🔒</span>
          <p className="text-left text-xs leading-relaxed text-foreground/80">
            Access is restricted to{" "}
            <span className="font-semibold text-primary">@q-summit.com</span> email addresses only.
          </p>
        </div>
      </div>
    ),
  },
};

export const TallCard: Story = {
  args: {
    title: "Complete Your Profile",
    description: "Tell us a bit about your role in Q-Summit",
    height: "h-[80vh]",
    children: (
      <div className="space-y-4">
        <p className="text-muted-foreground">Form content would go here...</p>
        <p className="text-muted-foreground">With multiple fields...</p>
        <p className="text-muted-foreground">And a submit button at the bottom.</p>
        <Button className="w-full">Complete Profile</Button>
      </div>
    ),
  },
};

export const ShortCard: Story = {
  args: {
    title: "Confirm Action",
    height: "h-[40vh]",
    contentClassName: "justify-center",
    children: (
      <div className="flex flex-col gap-4 text-center">
        <p className="text-muted-foreground">Are you sure you want to continue?</p>
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">Confirm</Button>
        </div>
      </div>
    ),
  },
};
