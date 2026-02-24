"use client";

import { Label } from "@/components/ui/label";
import { RadioGroupItem } from "@/components/ui/radio-group";
import type { Status } from "@/domain/qsum/profile";
import { cn } from "@/lib/utils";

export function MemberStatusOption(props: {
  value: Status;
  title: string;
  subtitle: string;
  selected: boolean;
}) {
  return (
    <Label
      htmlFor={props.value}
      className={cn(
        "relative flex cursor-pointer flex-col gap-1 rounded-xl border-2 bg-card px-4 py-3 shadow-sm transition-all",
        "hover:bg-muted/40",
        props.selected ? "border-primary bg-primary/5" : "border-border",
        props.selected ? "ring-2 ring-primary/15" : "ring-0",
      )}
    >
      <RadioGroupItem id={props.value} value={props.value} className="sr-only" />

      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{props.title}</div>
        <div
          className={cn("text-xs", props.selected ? "text-foreground/70" : "text-muted-foreground")}
        >
          {props.subtitle}
        </div>
      </div>
    </Label>
  );
}
