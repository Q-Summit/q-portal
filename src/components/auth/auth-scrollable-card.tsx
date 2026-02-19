"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import * as React from "react";

import logoImg from "@/assets/logo_blue.png";
import { AuthLogoBadge } from "@/components/auth/auth-logo-badge";
import { BrandCard } from "@/components/auth/brand-card";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AuthScrollableCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /**
   * Extra classes for the scrollable content area.
   * Use this to center content (justify-center) or adjust spacing.
   */
  contentClassName?: string;
  /**
   * Sets the height of the card. Defaults to "h-[80vh]".
   * Pass a tailwind class like "h-[600px]" or "h-auto" to override.
   */
  height?: string;
}

export function AuthScrollableCard({
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  height = "h-[80vh]",
}: AuthScrollableCardProps) {
  return (
    <div className={cn("relative w-full max-w-[420px]", height, className)}>
      <BrandCard className="flex h-full flex-col">
        {/* Fixed Header */}
        <CardHeader className="flex-none items-center pb-2 pt-10 text-center">
          <AuthLogoBadge>
            <Image
              src={logoImg}
              alt="Logo"
              width={56}
              height={56}
              className="h-12 w-12 object-contain"
              priority
            />
          </AuthLogoBadge>

          <CardTitle className={cn("text-2xl font-bold text-foreground", description && "mb-2")}>
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">{description}</CardDescription>
          )}
        </CardHeader>

        {/* Scrollable Content */}
        {/* Changed 'grid' to 'flex flex-col' for better alignment control */}
        <CardContent
          className={cn(
            "flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-10 py-4",
            contentClassName,
          )}
        >
          {children}
        </CardContent>

        {/* Fixed Footer */}
        <CardFooter className="mt-auto flex-none px-10 pb-8 pt-4">
          {footer === undefined ? (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="leading-relaxed">
                Your data is securely stored and used only for internal organization purposes.
                Changes can be made later.
              </p>
            </div>
          ) : (
            footer
          )}
        </CardFooter>
      </BrandCard>
    </div>
  );
}
