"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DIVISION_OPTIONS, TEAMS_BY_DIVISION, type Division } from "@/domain/qsum/profile";
import { api } from "@/server/api/client";
import { ChevronLeft, ChevronRight, Search, User, Users, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";

const PAGE_SIZE = 20;

const YEAR_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const y = new Date().getFullYear() - i;
  return { value: y, label: String(y) };
});

/** Sentinel used to represent "no selection" in shadcn Select (which doesn't support undefined values). */
const NONE = "__none__";

export function MemberList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [cursor, setCursor] = useState(0);
  const [division, setDivision] = useState<string | undefined>();
  const [team, setTeam] = useState<string | undefined>();
  const [year, setYear] = useState<number | undefined>();

  const resetCursor = () => setCursor(0);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      resetCursor();
    }, 300);
  };

  const teamOptions = division ? (TEAMS_BY_DIVISION[division as Division] ?? []) : [];

  const activeFilterCount = [division, team, year].filter(Boolean).length;

  const { data, isLoading } = api.profile.list.useQuery(
    {
      cursor,
      limit: PAGE_SIZE,
      search: debouncedSearch,
      division,
      team,
      year,
    },
    { refetchOnWindowFocus: false },
  );

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasNext = data?.nextCursor !== null && data?.nextCursor !== undefined;
  const hasPrev = cursor > 0;
  const currentPage = Math.floor(cursor / PAGE_SIZE) + 1;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="grid gap-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search members..."
          className="h-11 rounded-xl pl-10"
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={division ?? NONE}
          onValueChange={(val) => {
            setDivision(val === NONE ? undefined : val);
            setTeam(undefined);
            resetCursor();
          }}
        >
          <SelectTrigger
            className={`h-9 w-auto min-w-[130px] rounded-lg text-xs font-medium ${
              division ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground"
            }`}
          >
            <SelectValue placeholder="Board Area" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={NONE}>All Areas</SelectItem>
            {DIVISION_OPTIONS.map((d) => (
              <SelectItem key={d.value} value={d.value}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={team ?? NONE}
          onValueChange={(val) => {
            setTeam(val === NONE ? undefined : val);
            resetCursor();
          }}
          disabled={!division}
        >
          <SelectTrigger
            className={`h-9 w-auto min-w-[110px] rounded-lg text-xs font-medium ${
              team ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground"
            }`}
          >
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={NONE}>All Teams</SelectItem>
            {teamOptions.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={year?.toString() ?? NONE}
          onValueChange={(val) => {
            setYear(val === NONE ? undefined : Number(val));
            resetCursor();
          }}
        >
          <SelectTrigger
            className={`h-9 w-auto min-w-[90px] rounded-lg text-xs font-medium ${
              year ? "border-primary/30 bg-primary/5 text-primary" : "text-muted-foreground"
            }`}
          >
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value={NONE}>All Years</SelectItem>
            {YEAR_OPTIONS.map((y) => (
              <SelectItem key={y.value} value={String(y.value)}>
                {y.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setDivision(undefined);
              setTeam(undefined);
              setYear(undefined);
              resetCursor();
            }}
            className="h-9 gap-1 text-xs text-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" />
            Clear
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        {total} {total === 1 ? "member" : "members"} found
      </div>

      {/* Member Cards */}
      {isLoading && items.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">Loading members...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-border bg-white p-8 text-center text-muted-foreground shadow-sm">
          {debouncedSearch && activeFilterCount > 0
            ? `No members matching "${debouncedSearch}" with the selected filters.`
            : debouncedSearch
              ? `No members matching "${debouncedSearch}".`
              : activeFilterCount > 0
                ? "No members found with the selected filters."
                : "No members found."}
        </div>
      ) : (
        <div className="grid gap-3">
          {items.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(Math.max(0, cursor - PAGE_SIZE))}
            disabled={!hasPrev}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCursor(data?.nextCursor ?? cursor)}
            disabled={!hasNext}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Member Card ───────────────────────────────────────────────────────── */

function MemberCard({
  member,
}: {
  member: {
    id: string;
    name: string;
    image: string | null;
    division: string;
    team: string;
    status: string;
    lastActiveYear: number | null;
  };
}) {
  const divisionLabel =
    DIVISION_OPTIONS.find((d) => d.value === member.division)?.label ?? member.division;
  const teamLabel = member.division
    ? (TEAMS_BY_DIVISION[member.division as Division]?.find((t) => t.value === member.team)
        ?.label ?? member.team)
    : member.team;
  const year = member.lastActiveYear ?? new Date().getFullYear();

  return (
    <Link
      href={`/profile/${member.id}`}
      className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-slate-200">
        {member.image ? (
          <Image
            src={member.image}
            alt={member.name}
            width={48}
            height={48}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <User className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">{member.name}</span>
        <span className="text-xs text-muted-foreground">
          {divisionLabel} · {teamLabel} · {year}
          {member.status === "alumni" && " · Alumni"}
        </span>
      </div>
      <svg
        className="h-4 w-4 shrink-0 text-muted-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
