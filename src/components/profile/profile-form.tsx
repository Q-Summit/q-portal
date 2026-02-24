"use client";

import { ErrorBanner } from "@/components/alerting/error-banner";
import {
  formatFullPhoneNumber,
  parsePhoneNumber,
  PhoneInput,
  type CountryCode,
} from "@/components/profile/phone-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DIVISION_OPTIONS,
  TALENT_LABELS,
  TEAMS_BY_DIVISION,
  type Division,
  type Status,
  type TalentKey,
  type Team,
} from "@/domain/qsum/profile";
import { api } from "@/server/api/client";
import type { LucideIcon } from "lucide-react";
import {
  AlertCircle,
  Car,
  Check,
  CheckCircle2,
  Link as LinkIcon,
  Mail,
  Pencil,
  Phone,
  Save,
  Truck,
  User,
  Utensils,
  X,
} from "lucide-react";
import Image from "next/image";
import * as React from "react";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

interface FormState {
  status: Status;
  division: Division | "";
  team: Team | "";
  lastActiveYear: string;
  teamOther: string;
  phoneCountryCode: CountryCode;
  phoneNumber: string;
  privateEmail: string;
  linkedInUrl: string;
  talentIds: string[];
}

interface FieldErrors {
  phoneNumber?: string;
  privateEmail?: string;
  linkedInUrl?: string;
}

const INITIAL_STATE: FormState = {
  status: "active",
  division: "",
  team: "",
  lastActiveYear: "",
  teamOther: "",
  phoneCountryCode: "+49",
  phoneNumber: "",
  privateEmail: "",
  linkedInUrl: "",
  talentIds: [],
};

/* ──────────────────────────────────────────────────────────────────────────
 * Validation helpers
 * ────────────────────────────────────────────────────────────────────────── */

function validateLinkedInUrl(url: string): string | undefined {
  if (!url.trim()) return undefined;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "linkedin.com" && host !== "www.linkedin.com" && !host.endsWith(".linkedin.com")) {
      return "Please enter a valid LinkedIn URL (e.g., linkedin.com/in/yourname)";
    }
  } catch {
    return "Please enter a valid URL";
  }
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return undefined;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  return undefined;
}

function validatePhoneNumber(number: string): string | undefined {
  if (!number.trim()) return undefined;
  const digitsOnly = number.replace(/\D/g, "");
  if (digitsOnly.length < 6) return "Phone number is too short";
  if (digitsOnly.length > 15) return "Phone number is too long";
  return undefined;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

const TALENT_ICONS: Record<TalentKey, LucideIcon> = {
  driver_18plus: Car,
  driver_21plus: Car,
  driver_c1: Truck,
  gastro: Utensils,
};

type ProfileData = Record<string, unknown>;

function profileToFormState(p: ProfileData): FormState {
  const storedPhone = (p.phoneNumber as string) ?? "";
  const { countryCode, number } = parsePhoneNumber(storedPhone);
  return {
    status: (p.status as Status) ?? "active",
    division: (p.division as Division) ?? "",
    team: (p.team as Team) ?? "",
    lastActiveYear: p.lastActiveYear != null ? String(p.lastActiveYear as number) : "",
    teamOther: (p.teamOther as string) ?? "",
    phoneCountryCode: countryCode,
    phoneNumber: number,
    privateEmail: (p.privateEmail as string) ?? "",
    linkedInUrl: (p.linkedInUrl as string) ?? "",
    talentIds: (p.talentIds as string[]) ?? [],
  };
}

/* ──────────────────────────────────────────────────────────────────────────
 * Shared Sub-Components
 * ────────────────────────────────────────────────────────────────────────── */

function ProfileHeader({
  user,
  profile,
  divisionLabel,
  teamLabel,
  displayYear,
}: {
  user?: { name?: string | null; image?: string | null } | null;
  profile: boolean;
  divisionLabel: string | null;
  teamLabel: string | null;
  displayYear: string;
}) {
  return (
    <div className="relative flex flex-col items-center rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="relative mb-4">
        <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
          {user?.image ? (
            <Image
              src={user.image}
              alt={user.name ?? "Profile picture"}
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
        <h1 className="text-2xl font-bold text-foreground">{user?.name ?? "Member"}</h1>
        {profile && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle2 className="h-3 w-3" />
            Verified
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {divisionLabel && teamLabel
          ? `${divisionLabel} • ${teamLabel} • ${displayYear}`
          : "Complete your profile below"}
      </p>
    </div>
  );
}

function TalentCard({
  talentKey,
  isEnabled,
  editable,
  onToggle,
}: {
  talentKey: TalentKey;
  isEnabled: boolean;
  editable?: boolean;
  onToggle?: () => void;
}) {
  const labels = TALENT_LABELS[talentKey];
  const Icon = TALENT_ICONS[talentKey] ?? User;

  return (
    <div
      className={`flex items-center justify-between rounded-2xl border p-4 shadow-sm ${
        editable
          ? "border-border bg-white"
          : isEnabled
            ? "border-primary/30 bg-primary/5"
            : "border-border bg-white"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={editable || isEnabled ? "text-primary" : "text-muted-foreground/60"}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span
            className={`text-sm font-semibold ${
              editable || isEnabled ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {labels.label}
          </span>
          <span className="text-xs text-foreground/70">{labels.subtitle}</span>
        </div>
      </div>
      {editable ? (
        <Switch checked={isEnabled} onCheckedChange={onToggle} />
      ) : (
        isEnabled && <Check className="h-5 w-5 text-primary" />
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export function ProfileForm() {
  const { data, isLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const { data: talents = [] } = api.profile.listTalents.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const update = api.profile.update.useMutation();

  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [isEditing, setIsEditing] = React.useState(false);
  const hasInitialized = React.useRef(false);

  const user = data?.user;
  const profile = data?.profile;

  React.useEffect(() => {
    if (!profile || hasInitialized.current) return;
    setForm(profileToFormState(profile as ProfileData));
    hasInitialized.current = true;
  }, [profile]);

  // Derive display values
  const divisionLabel = form.division
    ? (DIVISION_OPTIONS.find((d) => d.value === form.division)?.label ?? null)
    : null;
  const teamLabel =
    form.division && form.team
      ? (TEAMS_BY_DIVISION[form.division]?.find((t) => t.value === form.team)?.label ?? null)
      : null;
  const displayYear = form.lastActiveYear || new Date().getFullYear().toString();
  const showTeamOther = form.team === "other";

  // Reset team when division changes
  React.useEffect(() => {
    setForm((prev) => {
      if (!prev.division) {
        if (!prev.team && !prev.teamOther) return prev;
        return { ...prev, team: "", teamOther: "" };
      }
      const validOptions = TEAMS_BY_DIVISION[prev.division] ?? [];
      if (!validOptions.some((opt) => opt.value === prev.team)) {
        return { ...prev, team: "", teamOther: "" };
      }
      return prev;
    });
  }, [form.division]);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleTalent = (talentId: string) => {
    setForm((prev) => ({
      ...prev,
      talentIds: prev.talentIds.includes(talentId)
        ? prev.talentIds.filter((id) => id !== talentId)
        : [...prev.talentIds, talentId],
    }));
  };

  const onSubmit = () => {
    if (!form.division || !form.team) return;

    const fieldErrors: FieldErrors = {
      phoneNumber: validatePhoneNumber(form.phoneNumber),
      privateEmail: validateEmail(form.privateEmail),
      linkedInUrl: validateLinkedInUrl(form.linkedInUrl),
    };

    const hasErrors = Object.values(fieldErrors).some(Boolean);
    setErrors(fieldErrors);
    if (hasErrors) return;

    const fullPhoneNumber = formatFullPhoneNumber(form.phoneCountryCode, form.phoneNumber);

    update.mutate(
      {
        status: form.status,
        division: form.division,
        team: form.team,
        lastActiveYear: form.lastActiveYear ? parseInt(form.lastActiveYear, 10) : null,
        teamOther: form.teamOther || null,
        phoneNumber: fullPhoneNumber || null,
        privateEmail: form.privateEmail || null,
        linkedInUrl: form.linkedInUrl || null,
        talentIds: form.talentIds,
      },
      {
        onSuccess: () => setIsEditing(false),
      },
    );
  };

  const cancelEdit = () => {
    if (profile) {
      setForm(profileToFormState(profile as ProfileData));
    }
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading profile...</div>;
  }

  const displayPhone = formatFullPhoneNumber(form.phoneCountryCode, form.phoneNumber);
  const canSubmit =
    !!form.division &&
    !!form.team &&
    (!showTeamOther || form.teamOther.trim().length >= 2) &&
    !update.isPending;

  // ── View Mode ──────────────────────────────────────────────────────────
  if (!isEditing) {
    return (
      <div className="grid gap-8">
        <ProfileHeader
          user={user}
          profile={!!profile}
          divisionLabel={divisionLabel}
          teamLabel={teamLabel}
          displayYear={displayYear}
        />

        {/* Personal Information */}
        <div>
          <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Personal Information</h2>
          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <ViewRow
              icon={Phone}
              label="Phone Number"
              value={displayPhone || "Not provided"}
              isEmpty={!displayPhone}
            />
            <ViewRow
              icon={Mail}
              label="Private Email"
              value={form.privateEmail || "Not provided"}
              isEmpty={!form.privateEmail}
            />
            <ViewRow
              icon={LinkIcon}
              label="LinkedIn Profile"
              value={form.linkedInUrl || "Not provided"}
              isEmpty={!form.linkedInUrl}
              isLast
              isLink={!!form.linkedInUrl}
            />
          </div>
        </div>

        {/* Talents */}
        <div>
          <div className="mb-3 flex items-end justify-between px-1">
            <h2 className="text-lg font-bold text-foreground">My Talents</h2>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              SKILLS & CERTS
            </span>
          </div>
          <div className="grid gap-3">
            {talents.map((t) => (
              <TalentCard
                key={t.id}
                talentKey={t.key as TalentKey}
                isEnabled={form.talentIds.includes(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Edit Button */}
        <Button
          onClick={() => setIsEditing(true)}
          variant="default"
          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-semibold"
        >
          <Pencil className="h-5 w-5" />
          Edit Profile
        </Button>
      </div>
    );
  }

  // ── Edit Mode ──────────────────────────────────────────────────────────
  return (
    <div className="grid gap-8">
      {update.error?.message && <ErrorBanner message={update.error.message} />}

      <ProfileHeader
        user={user}
        profile={!!profile}
        divisionLabel={divisionLabel}
        teamLabel={teamLabel}
        displayYear={displayYear}
      />

      {/* Membership Details */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Membership Details</h2>
        <div className="grid gap-4">
          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Board Area
            </Label>
            <Select
              value={form.division}
              onValueChange={(value) => updateField("division", value as Division)}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select your board area" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {DIVISION_OPTIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Team
            </Label>
            <Select
              value={form.team}
              onValueChange={(value) => {
                const next = value as Team;
                updateField("team", next);
                if (next !== "other") updateField("teamOther", "");
              }}
              disabled={!form.division}
            >
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue
                  placeholder={form.division ? "Select your team" : "Select board area first"}
                />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {form.division
                  ? TEAMS_BY_DIVISION[form.division].map((team) => (
                      <SelectItem key={team.value} value={team.value}>
                        {team.label}
                      </SelectItem>
                    ))
                  : null}
              </SelectContent>
            </Select>

            {showTeamOther && (
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground">Please specify your team</Label>
                <Input
                  className="mt-2 h-11 rounded-xl"
                  value={form.teamOther}
                  onChange={(e) => updateField("teamOther", e.target.value)}
                  placeholder="e.g. Former team name"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Personal Information</h2>
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Phone Number
            </span>
            <PhoneInput
              countryCode={form.phoneCountryCode}
              phoneNumber={form.phoneNumber}
              onCountryCodeChange={(code) => {
                updateField("phoneCountryCode", code);
                setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              onPhoneNumberChange={(num) => {
                updateField("phoneNumber", num);
                setErrors((prev) => ({ ...prev, phoneNumber: undefined }));
              }}
              error={errors.phoneNumber}
            />
          </div>

          <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <InfoRow
              icon={Mail}
              label="Private Email"
              value={form.privateEmail}
              onChange={(val) => {
                updateField("privateEmail", val);
                setErrors((prev) => ({ ...prev, privateEmail: undefined }));
              }}
              error={errors.privateEmail}
            />
            <InfoRow
              icon={LinkIcon}
              label="LinkedIn Profile"
              value={form.linkedInUrl}
              onChange={(val) => {
                updateField("linkedInUrl", val);
                setErrors((prev) => ({ ...prev, linkedInUrl: undefined }));
              }}
              error={errors.linkedInUrl}
              isLast
              isLink
              placeholder="https://linkedin.com/in/yourname"
            />
          </div>
        </div>
      </div>

      {/* Talents */}
      <div>
        <div className="mb-3 flex items-end justify-between px-1">
          <h2 className="text-lg font-bold text-foreground">My Talents</h2>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">
            SKILLS & CERTS
          </span>
        </div>
        <div className="grid gap-3">
          {talents.map((t) => (
            <TalentCard
              key={t.id}
              talentKey={t.key as TalentKey}
              isEnabled={form.talentIds.includes(t.id)}
              editable
              onToggle={() => toggleTalent(t.id)}
            />
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={cancelEdit}
          variant="outline"
          disabled={update.isPending}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-semibold"
        >
          <X className="h-5 w-5" />
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl text-lg font-semibold shadow-md"
        >
          <Save className="h-5 w-5" />
          {update.isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Row Sub-Components
 * ────────────────────────────────────────────────────────────────────────── */
function InfoRow({
  icon: Icon,
  label,
  value,
  onChange,
  error,
  isLast = false,
  isLink = false,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  isLast?: boolean;
  isLink?: boolean;
  placeholder?: string;
}) {
  return (
    <div className={`p-4 ${!isLast ? "border-b border-border" : ""}`}>
      <div className="flex items-center gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${error ? "bg-destructive/10 text-destructive" : "bg-primary/5 text-primary"}`}
        >
          {error ? <AlertCircle className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <input
            className={`w-full border-none bg-transparent p-0 text-sm font-medium focus:outline-none focus:ring-0 ${isLink ? "text-primary" : "text-foreground"}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? `Enter ${label.toLowerCase()}`}
          />
        </div>
        <Pencil className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
      </div>
      {error && (
        <div className="ml-14 mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}
    </div>
  );
}

// Helper component for view-only rows
function ViewRow({
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
