import { MemberProfileView } from "@/components/profile/member-profile-view";
import { auth } from "@/lib/auth";
import { buildLoginRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function MemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  if (!session?.user?.id) {
    const { id } = await params;
    redirect(buildLoginRedirect(`/profile/${id}`));
  }

  const { id } = await params;

  // If user is viewing their own profile, redirect to the editable version
  if (id === session.user.id) {
    redirect("/profile");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <MemberProfileView userId={id} />
    </div>
  );
}
