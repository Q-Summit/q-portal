"use client";

import {
  DIVISION_OPTIONS,
  TALENT_LABELS,
  TEAMS_BY_DIVISION,
  type Division,
  type TalentKey,
} from "@/domain/qsum/profile";
import { api } from "@/server/api/client";
import type { LucideIcon } from "lucide-react";
import {
  Car,
  Check,
  CheckCircle2,
  Link as LinkIcon,
  Mail,
  Phone,
  Truck,
  User,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const TALENT_ICONS: Record<string, LucideIcon> = {
  driver_18plus: Car,
  driver_21plus: Car,
  driver_c1: Truck,
  gastro: Utensils,
};

export function MemberProfileView({ userId }: { userId: string }) {
  const { data, isLoading, error } = api.profile.getByUserId.useQuery(
    { userId },
    { refetchOnWindowFocus: false },
  );

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {error.data?.code === "NOT_FOUND" ? "Profile not found." : "Failed to load profile."}
      </div>
    );
  }

  if (!data) return null;

  const divisionLabel = data.division
    ? (DIVISION_OPTIONS.find((d) => d.value === data.division)?.label ?? null)
    : null;
  const teamLabel =
    data.division && data.team
      ? (TEAMS_BY_DIVISION[data.division as Division]?.find((t) => t.value === data.team)?.label ??
        null)
      : null;
  const displayYear = data.lastActiveYear?.toString() ?? new Date().getFullYear().toString();

  return (
    <div className="grid gap-8">
      {/* Profile Header */}
      <div className="relative flex flex-col items-center rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="relative mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
            {data.image ? (
              <Image
                src={data.image}
                alt={data.name ?? "Profile picture"}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                <User className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{data.name}</h1>
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {divisionLabel && teamLabel
            ? `${divisionLabel} • ${teamLabel} • ${displayYear}`
            : "Member"}
        </p>
      </div>

      {/* Contact Information */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Contact Information</h2>
        <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <InfoRow
            icon={Phone}
            label="Phone Number"
            value={data.phoneNumber ?? "Not provided"}
            isEmpty={!data.phoneNumber}
          />
          <InfoRow
            icon={Mail}
            label="Private Email"
            value={data.privateEmail ?? "Not provided"}
            isEmpty={!data.privateEmail}
          />
          <InfoRow
            icon={LinkIcon}
            label="LinkedIn"
            value={data.linkedInUrl ?? "Not provided"}
            isEmpty={!data.linkedInUrl}
            isLast
            isLink={!!data.linkedInUrl}
          />
        </div>
      </div>

      {/* Talents */}
      {data.talents.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between px-1">
            <h2 className="text-lg font-bold text-foreground">Talents</h2>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              SKILLS & CERTS
            </span>
          </div>
          <div className="grid gap-3">
            {data.talents.map((t) => {
              const labels = TALENT_LABELS[t.key as TalentKey];
              const Icon = TALENT_ICONS[t.key] ?? User;
              return (
                <div
                  key={t.key}
                  className="flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-foreground">
                        {labels?.label ?? t.key}
                      </span>
                      <span className="text-xs text-foreground/70">{labels?.subtitle}</span>
                    </div>
                  </div>
                  <Check className="h-5 w-5 text-primary" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Back link */}
      <Link
        href="/profiles"
        className="text-center text-sm font-medium text-primary hover:underline"
      >
        ← Back to all members
      </Link>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  isLast = false,
  isLink = false,
  isEmpty = false,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  isLast?: boolean;
  isLink?: boolean;
  isEmpty?: boolean;
}) {
  return (
    <div className={`p-4 ${!isLast ? "border-b border-border" : ""}`}>
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          {isLink && !isEmpty ? (
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-primary hover:underline"
            >
              {value}
            </a>
          ) : (
            <span
              className={`truncate text-sm font-medium ${isEmpty ? "text-muted-foreground" : "text-foreground"}`}
            >
              {value}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
