"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TOOL_OPTIONS, type Tool } from "@/domain/qsum/shifts";
import { api } from "@/server/api/client";
import { AlertCircle, Calendar, Check, Clock, Link2, MapPin, Save, X } from "lucide-react";
import * as React from "react";

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

interface FormState {
  location: string;
  task: string;
  description: string;
  notionLink: string;
  startTime: string;
  endTime: string;
  skillIds: string[];
  tools: Tool[];
}

interface FieldErrors {
  location?: string;
  task?: string;
  notionLink?: string;
  startTime?: string;
  endTime?: string;
}

interface Talent {
  id: string;
  category: string;
  key: string;
}

const INITIAL_STATE: FormState = {
  location: "",
  task: "",
  description: "",
  notionLink: "",
  startTime: "",
  endTime: "",
  skillIds: [],
  tools: [],
};

/* ──────────────────────────────────────────────────────────────────────────
 * Validation helpers
 * ────────────────────────────────────────────────────────────────────────── */

function validateNotionUrl(url: string): string | undefined {
  if (!url.trim()) return undefined;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host !== "notion.so" && host !== "www.notion.so" && !host.endsWith(".notion.so")) {
      return "Please enter a valid Notion URL (e.g., notion.so/page)";
    }
  } catch {
    return "Please enter a valid URL";
  }
  return undefined;
}

function validateDateTime(dateTime: string): string | undefined {
  if (!dateTime) return "Required";
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "Invalid date/time";
  return undefined;
}

function validateTimeRange(startTime: string, endTime: string): string | undefined {
  if (!startTime || !endTime) return undefined;
  const start = new Date(startTime);
  const end = new Date(endTime);
  if (end <= start) return "End time must be after start time";
  return undefined;
}

const SLOT_INTERVAL_MS = 30 * 60 * 1000;

/** Build 30-min slots from start to end with a given headcount (for create payload). */
function buildSlotsForRange(startTime: Date, endTime: Date, headcount: number) {
  const slots: { slotTime: Date; headcount: number }[] = [];
  for (let ts = startTime.getTime(); ts < endTime.getTime(); ts += SLOT_INTERVAL_MS) {
    slots.push({ slotTime: new Date(ts), headcount });
  }
  return slots;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component
 * ────────────────────────────────────────────────────────────────────────── */

export function ShiftForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: talents = [] } = api.profile.listTalents.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  const create = api.shift.create.useMutation();

  const [form, setForm] = React.useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = React.useState<FieldErrors>({});

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when field changes
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const toggleSkill = (talentId: string) => {
    setForm((prev) => ({
      ...prev,
      skillIds: prev.skillIds.includes(talentId)
        ? prev.skillIds.filter((id) => id !== talentId)
        : [...prev.skillIds, talentId],
    }));
  };

  const toggleTool = (tool: Tool) => {
    setForm((prev) => ({
      ...prev,
      tools: prev.tools.includes(tool)
        ? prev.tools.filter((t) => t !== tool)
        : [...prev.tools, tool],
    }));
  };

  const validateForm = (): boolean => {
    const fieldErrors: FieldErrors = {
      location: !form.location.trim() ? "Location is required" : undefined,
      task: !form.task.trim() ? "Task is required" : undefined,
      notionLink: validateNotionUrl(form.notionLink),
      startTime: validateDateTime(form.startTime),
      endTime: validateDateTime(form.endTime),
    };

    const timeRangeError = validateTimeRange(form.startTime, form.endTime);
    if (timeRangeError && !fieldErrors.endTime) {
      fieldErrors.endTime = timeRangeError;
    }

    setErrors(fieldErrors);
    return !Object.values(fieldErrors).some(Boolean);
  };

  const onSubmit = () => {
    if (!validateForm()) return;

    const start = new Date(form.startTime);
    const end = new Date(form.endTime);
    create.mutate(
      {
        location: form.location.trim(),
        task: form.task.trim(),
        description: form.description.trim() || null,
        notionLink: form.notionLink.trim() || null,
        startTime: start,
        endTime: end,
        slots: buildSlotsForRange(start, end, 1),
        skillIds: form.skillIds,
        tools: form.tools,
      },
      {
        onSuccess: () => {
          setForm(INITIAL_STATE);
          onSuccess?.();
        },
      },
    );
  };

  const onCancel = () => {
    setForm(INITIAL_STATE);
    setErrors({});
  };

  const canSubmit =
    !!form.location.trim() &&
    !!form.task.trim() &&
    !!form.startTime &&
    !!form.endTime &&
    !create.isPending;

  // Group talents by category
  const talentsByCategory = React.useMemo(() => {
    const grouped = new Map<string, Talent[]>();
    for (const talent of talents) {
      const existing = grouped.get(talent.category) ?? [];
      existing.push(talent);
      grouped.set(talent.category, existing);
    }
    return grouped;
  }, [talents]);

  return (
    <div className="grid gap-6">
      {/* Error Banner */}
      {create.error?.message && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {create.error.message}
        </div>
      )}

      {/* Basic Information */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Basic Information</h2>
        <div className="grid gap-4">
          {/* Location */}
          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label
              htmlFor="shift-location"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Location
            </Label>
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Input
                id="shift-location"
                className="h-11 rounded-xl border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                placeholder="Enter location"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </div>
            {errors.location && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.location}
              </div>
            )}
          </div>

          {/* Task */}
          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label
              htmlFor="shift-task"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Task
            </Label>
            <Input
              id="shift-task"
              className="h-11 rounded-xl border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
              placeholder="Enter task description"
              value={form.task}
              onChange={(e) => updateField("task", e.target.value)}
            />
            {errors.task && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.task}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Time Schedule */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Time Schedule</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Start Time */}
          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label
              htmlFor="shift-startTime"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Start Time
            </Label>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Input
                id="shift-startTime"
                type="datetime-local"
                step={1800}
                aria-label="Start time"
                className="h-11 rounded-xl border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                value={form.startTime}
                onChange={(e) => updateField("startTime", e.target.value)}
              />
            </div>
            {errors.startTime && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.startTime}
              </div>
            )}
          </div>

          {/* End Time */}
          <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
            <Label
              htmlFor="shift-endTime"
              className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
            >
              End Time
            </Label>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <Input
                id="shift-endTime"
                type="datetime-local"
                step={1800}
                aria-label="End time"
                className="h-11 rounded-xl border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
                value={form.endTime}
                onChange={(e) => updateField("endTime", e.target.value)}
              />
            </div>
            {errors.endTime && (
              <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errors.endTime}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills */}
      {talents.length > 0 && (
        <div>
          <div className="mb-3 flex items-end justify-between px-1">
            <h2 className="text-lg font-bold text-foreground">Required Skills</h2>
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              SELECT ALL THAT APPLY
            </span>
          </div>
          <div className="grid gap-3">
            {Array.from(talentsByCategory.entries()).map(([category, categoryTalents]) => (
              <div
                key={category}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categoryTalents.map((talent) => (
                    <button
                      key={talent.id}
                      type="button"
                      onClick={() => toggleSkill(talent.id)}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                        form.skillIds.includes(talent.id)
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-foreground hover:bg-accent"
                      }`}
                    >
                      {form.skillIds.includes(talent.id) && <Check className="h-4 w-4" />}
                      {talent.key}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools */}
      <div>
        <div className="mb-3 flex items-end justify-between px-1">
          <h2 className="text-lg font-bold text-foreground">Required Tools</h2>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground">
            SELECT ALL THAT APPLY
          </span>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {TOOL_OPTIONS.map((tool) => (
              <button
                key={tool.value}
                type="button"
                onClick={() => toggleTool(tool.value)}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  form.tools.includes(tool.value)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                }`}
              >
                {form.tools.includes(tool.value) && <Check className="h-4 w-4" />}
                {tool.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notion Link */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Documentation</h2>
        <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <Label
            htmlFor="shift-notionLink"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground"
          >
            Notion Link
          </Label>
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <Input
              id="shift-notionLink"
              type="url"
              className="h-11 rounded-xl border-0 bg-transparent p-0 text-sm font-medium focus-visible:ring-0"
              placeholder="https://notion.so/..."
              value={form.notionLink}
              onChange={(e) => updateField("notionLink", e.target.value)}
            />
          </div>
          {errors.notionLink && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.notionLink}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <h2 className="mb-3 px-1 text-lg font-bold text-foreground">Description</h2>
        <div className="grid gap-2 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <textarea
            className="min-h-[120px] w-full resize-none rounded-xl border-0 bg-transparent p-0 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
            placeholder="Enter detailed description of the shift..."
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={create.isPending}
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
          {create.isPending ? "Creating..." : "Create Shift"}
        </Button>
      </div>
    </div>
  );
}
