import { MemberList } from "@/components/profile/member-list";
import { auth } from "@/lib/auth";
import { buildLoginRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilesPage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/profiles"));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Members</h1>
      <MemberList />
    </div>
  );
}
