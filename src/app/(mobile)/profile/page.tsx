import { ProfileForm } from "@/components/profile/profile-form";
import { auth } from "@/lib/auth";
import { buildLoginRedirect } from "@/lib/utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  if (!session?.user?.id) {
    redirect(buildLoginRedirect("/profile"));
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <ProfileForm />
    </div>
  );
}
