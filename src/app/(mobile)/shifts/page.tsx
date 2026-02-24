import { auth } from "@/lib/auth";
import { buildLoginRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ShiftsPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/shifts"));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground">Shifts</h1>
      <p className="mt-2 text-muted-foreground">Your upcoming shifts will appear here.</p>
      {/* TODO: Shifts list */}
    </div>
  );
}
