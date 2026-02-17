import { AuthShell } from "@/components/auth/auth-shell";
import * as React from "react";

export default function AuthLayout(props: { children: React.ReactNode }) {
  return (
    <AuthShell>
      <div className="flex w-full items-center justify-center px-4 py-10">{props.children}</div>
    </AuthShell>
  );
}
