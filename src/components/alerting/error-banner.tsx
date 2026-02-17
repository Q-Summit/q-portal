import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function ErrorBanner({
  title = "Something went wrong",
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive",
        className,
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold leading-none text-destructive-foreground">
          {title}
        </span>
        <span className="text-sm opacity-90">{message}</span>
      </div>
    </div>
  );
}
