"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/server/api/client";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import * as React from "react";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

interface Shift {
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

interface ShiftWithDetails extends Shift {
  skillIds: string[];
  tools: string[];
}

interface Talent {
  id: string;
  category: string;
  key: string;
}

interface ShiftListProps {
  shifts: Shift[];
  isLoading?: boolean;
  isPlanner?: boolean;
  onEdit?: (shift: ShiftWithDetails) => void;
  onDelete?: (shiftId: string) => void;
}

interface ShiftRowProps {
  shift: Shift;
  talents: Talent[];
  isEditing: boolean;
  onEditStart: () => void;
  onEditSave: (shiftId: string, data: { location: string; task: string }) => void;
  onEditCancel: () => void;
  onDelete: (shiftId: string) => void;
  isSaving?: boolean;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Helper Functions
 * ────────────────────────────────────────────────────────────────────────── */

function formatTimeRange(startTime: Date, endTime: Date): string {
  const start = new Date(startTime);
  const end = new Date(endTime);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const startDate = formatDate(start);
  const endDate = formatDate(end);
  const startTimeStr = formatTime(start);
  const endTimeStr = formatTime(end);

  if (startDate === endDate) {
    return `${startDate}, ${startTimeStr} - ${endTimeStr}`;
  }
  return `${startDate} ${startTimeStr} - ${endDate} ${endTimeStr}`;
}

function formatDuration(startTime: Date, endTime: Date): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const durationMs = end - start;
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Empty State Component
 * ────────────────────────────────────────────────────────────────────────── */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Calendar className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">No shifts yet</h2>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">
        Get started by creating your first shift. Shifts help you organize tasks and assign team
        members.
      </p>
      <p className="text-xs text-muted-foreground">Use the form above to create a new shift</p>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Loading Skeleton Component
 * ────────────────────────────────────────────────────────────────────────── */

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {/* Header Skeleton */}
      <div className="grid grid-cols-6 gap-4 rounded-lg bg-muted/50 px-4 py-3">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        <div className="h-4 w-16 animate-pulse rounded bg-muted" />
      </div>

      {/* Row Skeletons */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-6 gap-4 rounded-xl border border-border bg-white p-4 shadow-sm"
        >
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-12 animate-pulse rounded bg-muted" />
          <div className="h-5 w-full animate-pulse rounded bg-muted" />
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Skills Badge Component
 * ────────────────────────────────────────────────────────────────────────── */

function SkillsBadge({ skillIds, talents }: { skillIds: string[]; talents: Talent[] }) {
  if (skillIds.length === 0) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  const skillNames = skillIds.map((id) => talents.find((t) => t.id === id)?.key ?? id).slice(0, 3);

  const remaining = skillIds.length - skillNames.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {skillNames.map((name, i) => (
        <span
          key={i}
          className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-foreground"
        >
          {name}
        </span>
      ))}
      {remaining > 0 && <span className="text-xs text-muted-foreground">+{remaining}</span>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Inline Edit Row Component
 * ────────────────────────────────────────────────────────────────────────── */

interface InlineEditRowProps {
  shift: Shift;
  talents: Talent[];
  onSave: (shiftId: string, data: { location: string; task: string }) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

function InlineEditRow({ shift, talents, onSave, onCancel, isSaving }: InlineEditRowProps) {
  const [location, setLocation] = React.useState(shift.location);
  const [task, setTask] = React.useState(shift.task);
  const [errors, setErrors] = React.useState<{ location?: string; task?: string }>({});

  const handleSave = () => {
    const newErrors: { location?: string; task?: string } = {};

    if (!location.trim()) {
      newErrors.location = "Location is required";
    }
    if (!task.trim()) {
      newErrors.task = "Task is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(shift.id, { location: location.trim(), task: task.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <tr className="bg-accent/30">
      <td className="px-4 py-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) {
                  setErrors((prev) => ({ ...prev, location: undefined }));
                }
              }}
              onKeyDown={handleKeyDown}
              className="h-8 text-sm"
              placeholder="Enter location"
              disabled={isSaving}
              autoFocus
            />
          </div>
          {errors.location && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.location}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-1">
          <Input
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
              if (errors.task) {
                setErrors((prev) => ({ ...prev, task: undefined }));
              }
            }}
            onKeyDown={handleKeyDown}
            className="h-8 text-sm"
            placeholder="Enter task"
            disabled={isSaving}
          />
          {errors.task && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.task}
            </div>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTimeRange(shift.startTime, shift.endTime)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDuration(shift.startTime, shift.endTime)}
        </div>
      </td>
      <td className="px-4 py-3">
        {shift.slotSummary.totalHeadcount === 0 ? (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            <span>No slots</span>
          </div>
        ) : (
          <span className="text-sm font-medium">{shift.slotSummary.totalHeadcount}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <SkillsBadge skillIds={[]} talents={talents} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onCancel}
            disabled={isSaving}
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Shift Row Component
 * ────────────────────────────────────────────────────────────────────────── */

interface ShiftRowProps {
  shift: Shift;
  talents: Talent[];
  isEditing: boolean;
  isPlanner: boolean;
  onEditStart: () => void;
  onEditSave: (shiftId: string, data: { location: string; task: string }) => void;
  onEditCancel: () => void;
  onDelete: (shiftId: string) => void;
  isSaving?: boolean;
}

function ShiftRow({
  shift,
  talents,
  isEditing,
  isPlanner,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  isSaving,
}: ShiftRowProps) {
  if (isEditing) {
    return (
      <InlineEditRow
        shift={shift}
        talents={talents}
        onSave={onEditSave}
        onCancel={onEditCancel}
        isSaving={isSaving}
      />
    );
  }

  return (
    <tr className="group transition-colors hover:bg-muted/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-foreground">{shift.location}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-foreground">{shift.task}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{formatTimeRange(shift.startTime, shift.endTime)}</span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {formatDuration(shift.startTime, shift.endTime)}
        </div>
      </td>
      <td className="px-4 py-3">
        {shift.slotSummary.totalHeadcount === 0 ? (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            <span>No slots</span>
          </div>
        ) : (
          <span className="text-sm font-medium">{shift.slotSummary.totalHeadcount}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <SkillsBadge skillIds={[]} talents={talents} />
      </td>
      <td className="px-4 py-3">
        {isPlanner && (
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEditStart}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(shift.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export function ShiftList({
  shifts,
  isLoading,
  isPlanner = false,
  onEdit,
  onDelete,
}: ShiftListProps) {
  const { data: talents = [] } = api.profile.listTalents.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const [editingShiftId, setEditingShiftId] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleEditStart = (shiftId: string) => {
    setEditingShiftId(shiftId);
  };

  const handleEditSave = async (shiftId: string, data: { location: string; task: string }) => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call the API
      // For now, we just call the onEdit callback if provided
      const shift = shifts.find((s) => s.id === shiftId);
      if (shift && onEdit) {
        onEdit({
          ...shift,
          ...data,
          skillIds: [],
          tools: [],
        });
      }
      setEditingShiftId(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditCancel = () => {
    setEditingShiftId(null);
  };

  const handleDelete = (shiftId: string) => {
    if (onDelete) {
      onDelete(shiftId);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (shifts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Shift list">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Task
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Headcount
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Skills
              </th>
              {isPlanner && (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shifts.map((shift) => (
              <ShiftRow
                key={shift.id}
                shift={shift}
                talents={talents}
                isEditing={editingShiftId === shift.id}
                isPlanner={isPlanner}
                onEditStart={() => handleEditStart(shift.id)}
                onEditSave={handleEditSave}
                onEditCancel={handleEditCancel}
                onDelete={handleDelete}
                isSaving={isSaving}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
