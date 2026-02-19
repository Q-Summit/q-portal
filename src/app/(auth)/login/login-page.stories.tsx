/**
 * Stories for the Login page UI states.
 *
 * The actual LoginContent component uses useSearchParams and better-auth,
 * which require complex mocking. These stories focus on the visual states
 * that matter for review: the button states and error display.
 */

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Image from "next/image";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthScrollableCard } from "@/components/auth/auth-scrollable-card";
import { ErrorBanner } from "@/components/alerting/error-banner";
import { Button } from "@/components/ui/button";
import googleImg from "@/assets/google.svg";

function LoginCard({
  isRedirecting = false,
  error = null,
  onClick,
}: {
  isRedirecting?: boolean;
  error?: string | null;
  onClick?: () => void;
}) {
  const loginFooter = (
    <div className="flex w-full justify-between text-xs text-muted-foreground">
      <a href="#" className="transition-colors hover:text-foreground">
        Privacy Policy
      </a>
      <a href="#" className="transition-colors hover:text-foreground">
        Support
      </a>
    </div>
  );

  return (
    <AuthShell>
      <AuthScrollableCard
        title="Welcome back"
        description="Login to Q-Summit's Internal Hub"
        footer={loginFooter}
        contentClassName="justify-center gap-6"
        height="h-[50vh]"
      >
        {error && (
          <ErrorBanner
            title="Login Failed"
            message={error}
            className="animate-in fade-in slide-in-from-top-1"
          />
        )}

        <Button
          size="lg"
          className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
          onClick={onClick}
          disabled={isRedirecting}
        >
          {isRedirecting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Image width={20} height={20} src={googleImg} alt="Google" className="mr-3 h-5 w-5" />
              Sign in with Google
              <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
            </>
          )}
        </Button>

        <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
          <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
          <p className="text-left text-xs leading-relaxed text-foreground/80">
            Access is restricted to{" "}
            <span className="font-semibold text-primary">@q-summit.com</span> email addresses only.
          </p>
        </div>
      </AuthScrollableCard>
    </AuthShell>
  );
}

const meta = {
  title: "Auth/Login Page",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof LoginCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state - shows the Sign in with Google button
 */
export const Default: Story = {
  render: () => <LoginCard onClick={fn()} />,
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Loading state - shows spinner while connecting to Google OAuth
 */
export const Loading: Story = {
  render: () => <LoginCard isRedirecting={true} onClick={fn()} />,
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Error state - generic login error
 */
export const Error: Story = {
  render: () => <LoginCard error="An error occurred during sign in." onClick={fn()} />,
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Access denied - user signed in with non-q-summit email
 */
export const AccessDenied: Story = {
  render: () => <LoginCard error="Access restricted to @q-summit.com emails." onClick={fn()} />,
  parameters: {
    layout: "fullscreen",
  },
};

/**
 * Shows the login button in isolation for focused review
 */
export const ButtonOnly: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4 p-8">
      <Button
        size="lg"
        className="h-12 w-full max-w-[320px] rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
      >
        <Image width={20} height={20} src={googleImg} alt="Google" className="mr-3 h-5 w-5" />
        Sign in with Google
        <ArrowRight className="ml-2 h-4 w-4 opacity-80" />
      </Button>

      <Button
        size="lg"
        className="h-12 w-full max-w-[320px] rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all"
        disabled
      >
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Connecting...
      </Button>
    </div>
  ),
};
