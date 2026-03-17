"use client";

import { ErrorBanner } from "@/components/alerting/error-banner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/server/api/client";
import {
  AlertTriangle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Users,
} from "lucide-react";
import * as React from "react";
import { ShiftForm } from "./shift-form";
import { CsvExportButton } from "./csv-export-button";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

type ViewMode = "list" | "calendar";

interface ShiftListItem {
  id: string;
  location: string;
  task: string;
  description: string | null;
  notionLink: string | null;
  startTime: Date;
  endTime: Date;
  createdBy: string;
  createdAt: Date;
  slotSummary: {
    totalHeadcount: number;
  };
}

interface CalendarSlot {
  slotTime: Date;
  totalHeadcount: number;
  shifts: {
    shiftId: string;
    location: string;
    task: string;
    description: string | null;
    notionLink: string | null;
    startTime: Date;
    endTime: Date;
    headcount: number;
  }[];
}

/** Q-Summit 2026 dates — only these are valid for shift.calendar API */
const QSUMMIT_DATES: readonly Date[] = [
  new Date(2026, 3, 9), // April 9, 2026 (month is 0-indexed)
  new Date(2026, 3, 10), // April 10, 2026
];

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Helpers
 * ────────────────────────────────────────────────────────────────────────── */

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDateTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Sub-Components
 * ────────────────────────────────────────────────────────────────────────── */

function LoadingState() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex animate-pulse flex-col gap-3">
            <div className="h-5 w-3/4 rounded bg-muted" />
            <div className="h-4 w-1/2 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ message = "No shifts found" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
      <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

function ShiftCard({ shift }: { shift: ShiftListItem }) {
  return (
    <Card className="overflow-hidden border-border bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-foreground">{shift.task}</h3>
            <div className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{shift.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0" />
                <span>{formatDateTimeRange(shift.startTime, shift.endTime)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>{formatDate(shift.startTime)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {shift.slotSummary.totalHeadcount === 0 ? (
              <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Unstaffed</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Users className="h-3.5 w-3.5" />
                <span>{shift.slotSummary.totalHeadcount}</span>
              </div>
            )}
          </div>
        </div>
        {shift.description && (
          <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{shift.description}</p>
        )}
      </div>
    </Card>
  );
}

function CalendarView({
  slots,
  selectedDate,
  onDateChange,
}: {
  slots: CalendarSlot[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}) {
  const currentIndex = (() => {
    const i = QSUMMIT_DATES.findIndex((d) => isSameCalendarDay(d, selectedDate));
    return i >= 0 ? i : 0;
  })();
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < QSUMMIT_DATES.length - 1;

  const navigateDay = (direction: "prev" | "next") => {
    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, QSUMMIT_DATES.length - 1)
        : Math.max(currentIndex - 1, 0);
    onDateChange(QSUMMIT_DATES[newIndex]);
  };

  // Group slots by hour for display
  const slotsByHour = React.useMemo(() => {
    const grouped = new Map<number, CalendarSlot[]>();
    for (const slot of slots) {
      const hour = slot.slotTime.getHours();
      const existing = grouped.get(hour) ?? [];
      existing.push(slot);
      grouped.set(hour, existing);
    }
    return new Map([...grouped.entries()].sort((a, b) => a[0] - b[0]));
  }, [slots]);

  return (
    <div className="grid gap-4">
      {/* Date Navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white p-3 shadow-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDay("prev")}
          disabled={!canGoPrev}
          className="h-9 w-9"
          aria-label="Previous day"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center">
          <div className="font-semibold text-foreground">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-xs text-muted-foreground">{selectedDate.getFullYear()}</div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDay("next")}
          disabled={!canGoNext}
          className="h-9 w-9"
          aria-label="Next day"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Slots */}
      {slots.length === 0 ? (
        <EmptyState message="No shifts scheduled for this day" />
      ) : (
        <div className="grid gap-3">
          {Array.from(slotsByHour.entries()).map(([hour, hourSlots]) => (
            <div key={hour} className="grid gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{`${hour.toString().padStart(2, "0")}:00`}</span>
              </div>
              <div className="grid gap-2">
                {hourSlots.map((slot) => (
                  <Card key={slot.slotTime.toISOString()} className="overflow-hidden border-border">
                    <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatTime(slot.slotTime)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Users className="h-3.5 w-3.5" />
                        <span>{slot.totalHeadcount} volunteers</span>
                      </div>
                    </div>
                    <div className="p-3">
                      {slot.shifts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No shifts at this time</p>
                      ) : (
                        <div className="grid gap-2">
                          {slot.shifts.map((shift) => (
                            <div
                              key={shift.shiftId}
                              className="flex items-start justify-between gap-2 rounded-lg border border-border bg-white p-2.5"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-foreground">
                                  {shift.task}
                                </p>
                                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  <span className="truncate">{shift.location}</span>
                                </p>
                              </div>
                              <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                <Users className="h-3 w-3" />
                                <span>{shift.headcount}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateShiftModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Create New Shift</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        </div>
        <ShiftForm onSuccess={onClose} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export function ShiftManager() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(() => {
    // Default to April 9, 2026 (Q-Summit date)
    const date = new Date(2026, 3, 9); // Month is 0-indexed
    return date;
  });

  // Check if user has planner role
  const { data: profileData, isLoading: isProfileLoading } = api.profile.getMy.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const isPlanner =
    (profileData?.profile?.division === "chair" || profileData?.user?.isHeadOf === true) ?? false;

  // Fetch shifts list
  const {
    data: listData,
    isLoading: isListLoading,
    error: listError,
    refetch: refetchList,
  } = api.shift.list.useQuery(
    {
      limit: 50,
      sortField: "startTime",
      sortDirection: "asc",
    },
    {
      refetchOnWindowFocus: false,
      enabled: viewMode === "list",
    },
  );

  // Fetch calendar data
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    error: calendarError,
    refetch: refetchCalendar,
  } = api.shift.calendar.useQuery(
    {
      date: selectedDate,
    },
    {
      refetchOnWindowFocus: false,
      enabled: viewMode === "calendar",
    },
  );

  const isLoading = isListLoading || isCalendarLoading || isProfileLoading;
  const error = listError ?? calendarError;

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRefresh = () => {
    if (viewMode === "list") {
      void refetchList();
    } else {
      void refetchCalendar();
    }
  };

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Shifts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage volunteer shifts for Q-Summit 2026
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex rounded-lg border border-border bg-muted p-1">
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="text-xs font-medium"
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="text-xs font-medium"
            >
              Calendar
            </Button>
          </div>
          {/* Create Button - Only for planners */}
          {isPlanner && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Create</span>
            </Button>
          )}
          {/* Export Button - Only for planners and in list view */}
          {isPlanner && viewMode === "list" && <CsvExportButton />}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <ErrorBanner
          title="Failed to load shifts"
          message={error.message}
          className="animate-in fade-in slide-in-from-top-2"
        />
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          {viewMode === "list" && (
            <>
              <h2 className="sr-only">Shift list</h2>
              {listData?.items && listData.items.length > 0 ? (
                <div className="grid gap-3">
                  {listData.items.map((shift) => (
                    <ShiftCard key={shift.id} shift={shift as ShiftListItem} />
                  ))}
                </div>
              ) : (
                <EmptyState />
              )}
            </>
          )}

          {viewMode === "calendar" && (
            <CalendarView
              slots={(calendarData ?? []) as CalendarSlot[]}
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          )}
        </>
      )}

      {/* Create Modal */}
      <CreateShiftModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
}
