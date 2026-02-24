import { auth } from "@/lib/auth";
import { buildLoginRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/dashboard"));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Welcome back, {session.user.name}!</p>
      {/* TODO: Dashboard content */}
    </div>
  );
}
