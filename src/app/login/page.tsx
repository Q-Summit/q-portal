"use client";

import { authClient } from "@/lib/auth-client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { LockKeyhole, Loader2 } from "lucide-react";
import Image from "next/image";
import logoImg from "@/assets/logo_blue.png";

function LoginContent() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async () => {
    setIsRedirecting(true);

    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className="w-full max-w-[420px] relative">
      <Card className="border-0 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#0f2d5e] via-[#b3404a] to-[#ff7f50]" />

        <CardHeader className="flex flex-col items-center text-center pt-10 pb-2">
          <div className="mb-6 shadow-md rounded-2xl overflow-hidden">
            <Image
              src={logoImg}
              alt="Q-Summit Logo"
              width={64}
              height={64}
              className="w-16 h-16 object-cover"
              priority
            />
          </div>

          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome back
          </CardTitle>
          <CardDescription className="text-gray-500 mt-2">
            Login to Q-Summit's Internal Hub
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 px-10 pb-8 pt-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-center justify-center animate-in fade-in slide-in-from-top-1 text-center">
              {error === "ACCESS_DENIED"
                ? "Access restricted to @q-summit.com emails."
                : "An error occurred during sign in."}
            </div>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 font-medium border-gray-200 text-base shadow-sm relative"
            onClick={handleLogin}
            disabled={isRedirecting}
          >
            {isRedirecting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Image
                width={5}
                height={5}
                src="https://authjs.dev/img/providers/google.svg"
                alt="Google"
                className="w-5 h-5 mr-3"
              />
            )}
            {isRedirecting ? "Connecting..." : "Sign in with Google"}
          </Button>

          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex gap-3 items-start">
            <LockKeyhole className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-xs text-gray-500 leading-relaxed text-left">
              Access is restricted to{" "}
              <span className="font-semibold text-gray-700">@q-summit.com</span>{" "}
              email addresses only.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between px-10 pb-8 text-xs text-gray-400">
          <a href="#" className="hover:text-gray-600 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-600 transition-colors">
            Support
          </a>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <Suspense
        fallback={
          <div className="w-full max-w-[420px] h-[500px] animate-pulse bg-gray-100 rounded-lg" />
        }
      >
        <LoginContent />
      </Suspense>
    </div>
  );
}
