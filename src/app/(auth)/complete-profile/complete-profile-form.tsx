"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DIVISION_OPTIONS,
  TEAMS_BY_DIVISION,
  type Division,
  type Status,
  type Team,
} from "@/domain/qsum/profile";
import { api } from "@/server/api/client";
import { useRouter } from "next/navigation";
import * as React from "react";

import { ErrorBanner } from "@/components/alerting/error-banner";
import { AuthScrollableCard } from "@/components/auth/auth-scrollable-card";
import { MemberStatusOption } from "@/components/profile/member-status-option";

// Helper to generate years from 2016 to now
const YEARS = (function getYears() {
  const current = new Date().getFullYear();
  const start = 2016;
  const list = [];
  for (let y = current; y >= start; y--) list.push(String(y));
  return list;
})();

interface CompleteProfileFormProps {
  callbackUrl?: string;
}

export default function CompleteProfileForm({ callbackUrl }: CompleteProfileFormProps) {
  const router = useRouter();

  // 1. Fetch existing profile data (if any)
  const { data: me } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const complete = api.profile.complete.useMutation({
    onSuccess: () => {
      // Redirect to the saved URL or default to dashboard
      router.push(callbackUrl ?? "/dashboard");
      router.refresh(); // Ensure server components update
    },
  });

  // 2. State Management
  const [status, setStatus] = React.useState<Status>("active");
  const [division, setDivision] = React.useState<Division | "">("");
  const [team, setTeam] = React.useState<Team | "">("");
  const [lastActiveYear, setLastActiveYear] = React.useState<string>("");
  const [teamOther, setTeamOther] = React.useState("");

  // 3. Effect: Pre-fill form when data loads
  // Super edge case and should realistically only happen if we mess up in the future
  // or meddle with the database directly.
  React.useEffect(() => {
    if (!me) return;

    setStatus(me.status as Status);
    setDivision(me.division as Division);
    setLastActiveYear(me.lastActiveYear ? String(me.lastActiveYear) : "");

    const dbTeam = me.team as Team;
    setTeam(dbTeam);
    setTeamOther(me.teamOther ?? "");
  }, [me]);

  // 4. Effect: Reset Team if Division changes
  React.useEffect(() => {
    if (!division) {
      setTeam(""); // Reset if no division
      return;
    }

    const validOptions = TEAMS_BY_DIVISION[division];
    const isCurrentTeamValid = validOptions.some((opt) => opt.value === team);

    if (!isCurrentTeamValid) {
      setTeam(""); // Reset selection
      setTeamOther(""); // Reset custom input
    }
  }, [division, team]);

  // 5. Logic Helpers
  const showLastActiveYear = status === "alumni";
  const showTeamOther = team === "other";

  const canSubmit =
    division !== "" &&
    team !== "" &&
    (!showLastActiveYear || lastActiveYear !== "") &&
    (!showTeamOther || teamOther.trim().length >= 2);

  const onSubmit = () => {
    if (!division || !team) return;

    complete.mutate({
      status,
      lastActiveYear: status === "alumni" ? Number(lastActiveYear) : null,
      division,
      team,
      teamOther: team === "other" ? teamOther.trim() : null,
    });
  };

  const errorText = complete.error?.message ?? null;

  return (
    <AuthScrollableCard
      title="Complete Your Profile"
      description="Tell us a bit about your role in Q-Summit"
    >
      {errorText && <ErrorBanner message={errorText} />}

      {/* Member Status */}
      <div className="grid gap-3">
        <div className="text-sm font-semibold text-foreground">Member Status</div>
        <RadioGroup
          value={status}
          onValueChange={(v) => setStatus(v as Status)}
          className="grid grid-cols-2 gap-4"
        >
          <MemberStatusOption
            value="active"
            title="Active Member"
            subtitle="Current team"
            selected={status === "active"}
          />
          <MemberStatusOption
            value="alumni"
            title="Alumni"
            subtitle="Former team"
            selected={status === "alumni"}
          />
        </RadioGroup>
      </div>

      {/* Alumni: Year Selection */}
      {showLastActiveYear && (
        <div className="animate-in fade-in slide-in-from-top-2 grid gap-2">
          <Label className="text-sm font-semibold text-foreground">Last active Q-Summit year</Label>
          <Select value={lastActiveYear} onValueChange={setLastActiveYear}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue placeholder="Select your last active year" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {YEARS.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Division (Board Area) */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground">Board Area</Label>
        <Select value={division} onValueChange={(v) => setDivision(v as Division)}>
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

      {/* Team Selection */}
      <div className="grid gap-2">
        <Label className="text-sm font-semibold text-foreground">Team</Label>
        <Select
          value={team}
          onValueChange={(v) => {
            const next = v as Team;
            setTeam(next);
            if (next !== "other") setTeamOther("");
          }}
          disabled={!division}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder={division ? "Select your team" : "Select board area first"} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {division
              ? TEAMS_BY_DIVISION[division].map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>

        {/* Custom Team Input */}
        {showTeamOther && (
          <div className="animate-in fade-in slide-in-from-top-2 pt-2">
            <Label className="text-xs text-muted-foreground">Please specify your team</Label>
            <Input
              className="mt-2 h-11 rounded-xl"
              value={teamOther}
              onChange={(e) => setTeamOther(e.target.value)}
              placeholder="e.g. Former team name"
              autoFocus
            />
          </div>
        )}
      </div>

      <Button
        onClick={onSubmit}
        disabled={!canSubmit || complete.isPending}
        className="h-12 rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
      >
        {complete.isPending ? "Saving..." : "Complete Profile →"}
      </Button>
    </AuthScrollableCard>
  );
}
