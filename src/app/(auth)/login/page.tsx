"use client";

import googleImg from "@/assets/google.svg";
import { ErrorBanner } from "@/components/alerting/error-banner";
import { AuthScrollableCard } from "@/components/auth/auth-scrollable-card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginContent() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard"; // Default if no baton

  const handleLogin = async () => {
    setError(null);

    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: `/post-auth?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      },
      {
        onRequest: () => setIsRedirecting(true),
        onError: (ctx) => {
          setIsRedirecting(false);
          setError(ctx?.error?.message ?? "An error occurred during sign in.");
        },
      },
    );
  };

  const errorMessage =
    error === "ACCESS_DENIED" ? "Access restricted to @q-summit.com emails." : error;

  const loginFooter = (
    <div className="flex w-full justify-between text-xs text-muted-foreground">
      <Link href="/privacy" className="transition-colors hover:text-foreground">
        Privacy Policy
      </Link>
      <Link href="#" className="transition-colors hover:text-foreground">
        Support
      </Link>
    </div>
  );

  return (
    <AuthScrollableCard
      title="Welcome back"
      description="Login to Q-Summit's Internal Hub"
      footer={loginFooter}
      contentClassName="justify-center gap-6"
      height="h-[50vh]"
    >
      {/* Error Banner */}
      {errorMessage && (
        <ErrorBanner
          title="Login Failed"
          message={errorMessage}
          className="animate-in fade-in slide-in-from-top-1"
        />
      )}

      {/* Login Button */}
      <Button
        size="lg"
        className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98]"
        onClick={handleLogin}
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

      {/* Info Box */}
      <div className="flex items-start gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4">
        <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
        <p className="text-left text-xs leading-relaxed text-foreground/80">
          Access is restricted to <span className="font-semibold text-primary">@q-summit.com</span>{" "}
          email addresses only.
        </p>
      </div>
    </AuthScrollableCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-[50vh] w-full max-w-[420px] animate-pulse rounded-xl border bg-card shadow-xl" />
      }
    >
      <LoginContent />
    </Suspense>
  );
}
