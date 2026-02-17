import { cn } from "@/lib/utils";

export function BrandCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border bg-card text-card-foreground shadow", className)}>
      {children}
    </div>
  );
}
