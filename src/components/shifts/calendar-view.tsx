"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/server/api/client";
import { useIsPlanner } from "@/lib/use-is-planner";
import { ChevronLeft, ChevronRight, Clock, MapPin, Users, Calendar, X } from "lucide-react";
import * as React from "react";

/* ──────────────────────────────────────────────────────────────────────────
 * Constants
 * ────────────────────────────────────────────────────────────────────────── */

/** Q-Summit 2026 dates */
const QSUMMIT_DATES = [
  new Date(2026, 3, 9), // April 9, 2026 (month is 0-indexed)
  new Date(2026, 3, 10), // April 10, 2026
];

/** Calendar time range: 06:00 to 23:00 */
const START_HOUR = 6;
const END_HOUR = 23;
const _SLOT_DURATION_MINUTES = 30;

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

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

interface CalendarViewProps {
  /** Pre-loaded slots data (optional - for Storybook) */
  slots?: CalendarSlot[];
  /** Currently selected date */
  selectedDate?: Date;
  /** Callback when date changes */
  onDateChange?: (date: Date) => void;
  /** Loading state (for Storybook) */
  isLoading?: boolean;
}

interface ShiftDetailModalProps {
  slot: CalendarSlot | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Helper Functions
 * ────────────────────────────────────────────────────────────────────────── */

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function _formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatDateTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

/** Generate all 30-min time slots from START_HOUR to END_HOUR */
function generateTimeSlots(): Date[] {
  const slots: Date[] = [];
  const baseDate = new Date(2026, 3, 9); // Use April 9 as base

  for (let hour = START_HOUR; hour <= END_HOUR; hour++) {
    for (const minute of [0, 30]) {
      if (hour === END_HOUR && minute === 30) break;
      const slotTime = new Date(baseDate);
      slotTime.setHours(hour, minute, 0, 0);
      slots.push(slotTime);
    }
  }

  return slots;
}

/** Get unique locations from all slots */
function getUniqueLocations(slots: CalendarSlot[]): string[] {
  const locations = new Set<string>();
  for (const slot of slots) {
    for (const shift of slot.shifts) {
      locations.add(shift.location);
    }
  }
  return Array.from(locations).sort();
}

/** Get headcount for a specific slot time and location */
function getHeadcountForSlot(slots: CalendarSlot[], slotTime: Date, location: string): number {
  const slot = slots.find((s) => s.slotTime.getTime() === slotTime.getTime());
  if (!slot) return 0;

  const shift = slot.shifts.find((sh) => sh.location === location);
  return shift?.headcount ?? 0;
}

/** Get shifts for a specific slot time and location */
function getShiftsForSlot(
  slots: CalendarSlot[],
  slotTime: Date,
  location: string,
): CalendarSlot["shifts"] {
  const slot = slots.find((s) => s.slotTime.getTime() === slotTime.getTime());
  if (!slot) return [];

  return slot.shifts.filter((sh) => sh.location === location);
}

/* ──────────────────────────────────────────────────────────────────────────
 * Sub-Components
 * ────────────────────────────────────────────────────────────────────────── */

function LoadingState() {
  const timeSlots = generateTimeSlots();

  return (
    <div className="grid gap-4">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-white p-3 shadow-sm">
        <div className="h-9 w-9 animate-pulse rounded bg-muted" />
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-9 w-9 animate-pulse rounded bg-muted" />
      </div>

      {/* Calendar Grid Skeleton */}
      <Card className="overflow-hidden border-border">
        <div className="grid" style={{ gridTemplateColumns: `80px repeat(3, 1fr)` }}>
          {/* Time column header */}
          <div className="border-b border-r border-border bg-muted/50 p-3">
            <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          </div>
          {/* Location headers */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-b border-r border-border bg-muted/50 p-3">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}

          {/* Time slots */}
          {timeSlots.map((_, index) => (
            <React.Fragment key={index}>
              <div className="border-b border-r border-border p-3">
                <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="border-b border-r border-border p-3">
                  <div className="mx-auto h-6 w-8 animate-pulse rounded bg-muted" />
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}

function EmptyState({ message = "No shifts scheduled" }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
      <Calendar className="mb-3 h-10 w-10 text-muted-foreground/50" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
    </div>
  );
}

function ShiftDetailModal({ slot, isOpen, onClose }: ShiftDetailModalProps) {
  if (!isOpen || !slot) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {formatTime(slot.slotTime)} Shifts
            </h2>
            <p className="text-sm text-muted-foreground">
              {slot.shifts.length} shift{slot.shifts.length !== 1 ? "s" : ""} •{" "}
              {slot.totalHeadcount} volunteer
              {slot.totalHeadcount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-3">
          {slot.shifts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No shifts at this time</p>
          ) : (
            slot.shifts.map((shift) => (
              <Card key={shift.shiftId} className="overflow-hidden border-border bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-foreground">{shift.task}</h3>
                    <div className="mt-1 flex flex-col gap-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{shift.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{formatDateTimeRange(shift.startTime, shift.endTime)}</span>
                      </div>
                    </div>
                    {shift.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                        {shift.description}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                    <Users className="h-3.5 w-3.5" />
                    <span>{shift.headcount}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export function CalendarView({
  slots: propSlots,
  selectedDate: propSelectedDate,
  onDateChange: propOnDateChange,
  isLoading: propIsLoading,
}: CalendarViewProps) {
  const { isPlanner: _isPlanner } = useIsPlanner();

  // Internal state for date (used when props not provided)
  const [internalDate, setInternalDate] = React.useState(() => QSUMMIT_DATES[0]);
  const [selectedSlot, setSelectedSlot] = React.useState<CalendarSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Use prop value or internal state
  const selectedDate = propSelectedDate ?? internalDate;
  const setSelectedDate = propOnDateChange ?? setInternalDate;

  // Fetch calendar data from tRPC (only if slots not provided via props)
  const {
    data: fetchedSlots,
    isLoading: isFetching,
    error,
  } = api.shift.calendar.useQuery(
    { date: selectedDate },
    {
      refetchOnWindowFocus: false,
      enabled: propSlots === undefined,
    },
  );

  // Memoize slots to prevent dependency changes on every render
  const slots = React.useMemo(
    () => propSlots ?? (fetchedSlots as CalendarSlot[]) ?? [],
    [propSlots, fetchedSlots],
  );
  const isLoading = propIsLoading ?? isFetching;

  // Generate time slots
  const timeSlots = React.useMemo(() => generateTimeSlots(), []);

  // Get unique locations
  const locations = React.useMemo(() => getUniqueLocations(slots), [slots]);

  // Navigation handlers
  const navigateDay = (direction: "prev" | "next") => {
    const currentIndex = QSUMMIT_DATES.findIndex((d) => d.getTime() === selectedDate.getTime());
    const newIndex =
      direction === "next"
        ? Math.min(currentIndex + 1, QSUMMIT_DATES.length - 1)
        : Math.max(currentIndex - 1, 0);
    setSelectedDate(QSUMMIT_DATES[newIndex]);
  };

  const canGoPrev = QSUMMIT_DATES.findIndex((d) => d.getTime() === selectedDate.getTime()) > 0;
  const canGoNext =
    QSUMMIT_DATES.findIndex((d) => d.getTime() === selectedDate.getTime()) <
    QSUMMIT_DATES.length - 1;

  // Handle cell click
  const handleCellClick = (slotTime: Date, location: string) => {
    const slotShifts = getShiftsForSlot(slots, slotTime, location);
    const totalHeadcount = slotShifts.reduce((sum, s) => sum + s.headcount, 0);

    if (slotShifts.length > 0) {
      setSelectedSlot({
        slotTime,
        totalHeadcount,
        shifts: slotShifts,
      });
      setIsModalOpen(true);
    }
  };

  // Handle time row click (show all shifts for that time)
  const handleTimeRowClick = (slotTime: Date) => {
    const slot = slots.find((s) => s.slotTime.getTime() === slotTime.getTime());
    if (slot && slot.shifts.length > 0) {
      setSelectedSlot(slot);
      setIsModalOpen(true);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
        <p className="text-sm font-medium">Failed to load calendar data</p>
        <p className="text-xs">{error.message}</p>
      </div>
    );
  }

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
          <div className="font-semibold text-foreground">{formatDate(selectedDate)}</div>
          <div className="text-xs text-muted-foreground">Q-Summit 2026</div>
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

      {/* Calendar Grid */}
      {slots.length === 0 ? (
        <EmptyState message="No shifts scheduled for this day" />
      ) : (
        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto" role="region" aria-label="Calendar grid" tabIndex={0}>
            <div
              className="grid min-w-[600px]"
              style={{
                gridTemplateColumns: `80px repeat(${Math.max(locations.length, 1)}, 1fr)`,
              }}
            >
              {/* Header Row */}
              <div className="sticky left-0 z-10 border-b border-r border-border bg-muted/50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Time</span>
                </div>
              </div>
              {locations.length === 0 ? (
                <div className="border-b border-r border-border bg-muted/50 p-3">
                  <span className="text-xs font-semibold text-muted-foreground">Location</span>
                </div>
              ) : (
                locations.map((location) => (
                  <div key={location} className="border-b border-r border-border bg-muted/50 p-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span
                        className="truncate text-xs font-semibold text-muted-foreground"
                        title={location}
                      >
                        {location}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {/* Time Slots */}
              {timeSlots.map((slotTime) => {
                const slot = slots.find((s) => s.slotTime.getTime() === slotTime.getTime());
                const hasAnyShifts = slot && slot.shifts.length > 0;

                return (
                  <React.Fragment key={slotTime.getTime()}>
                    {/* Time Column */}
                    <div
                      className={`sticky left-0 z-10 border-b border-r border-border bg-muted/30 p-3 ${
                        hasAnyShifts ? "cursor-pointer hover:bg-muted/50" : ""
                      }`}
                      onClick={() => handleTimeRowClick(slotTime)}
                    >
                      <span className="text-xs font-medium text-muted-foreground">
                        {formatTime(slotTime)}
                      </span>
                    </div>

                    {/* Location Cells */}
                    {locations.length === 0 ? (
                      <div className="border-b border-r border-border p-3">
                        <span className="text-xs text-muted-foreground">-</span>
                      </div>
                    ) : (
                      locations.map((location) => {
                        const headcount = getHeadcountForSlot(slots, slotTime, location);
                        const hasShifts = headcount > 0;

                        return (
                          <div
                            key={`${slotTime.getTime()}-${location}`}
                            className={`border-b border-r border-border p-2 ${
                              hasShifts
                                ? "cursor-pointer bg-primary/5 hover:bg-primary/10"
                                : "bg-white"
                            }`}
                            onClick={() => handleCellClick(slotTime, location)}
                          >
                            <div className="flex items-center justify-center">
                              {hasShifts ? (
                                <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                                  <Users className="h-3 w-3" />
                                  <span>{headcount}</span>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground/30">-</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded bg-primary/10" />
          <span>Has shifts</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 rounded border border-border bg-white" />
          <span>No shifts</span>
        </div>
        <div className="ml-auto text-xs">Click a cell to view shift details</div>
      </div>

      {/* Shift Detail Modal */}
      <ShiftDetailModal
        slot={selectedSlot}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
