import * as React from "react";

export function AuthShell(props: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] px-4 py-10 [background-size:16px_16px]">
      {props.children}
    </div>
  );
}
