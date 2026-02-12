import * as React from "react";

export function AuthLogoBadge(props: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-[#0f2d5e] shadow-md">
      <div className="rounded-xl bg-white/95 p-1.5">{props.children}</div>
    </div>
  );
}
