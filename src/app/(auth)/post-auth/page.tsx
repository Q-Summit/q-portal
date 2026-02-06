import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { isValidRedirectPath } from "@/lib/utils";
import { db } from "@/server/db";
import { memberProfile } from "@/server/db/schema";

interface PostAuthPageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function PostAuthPage(props: PostAuthPageProps) {
  const h = await headers();
  const { callbackUrl } = await props.searchParams;

  const session = await auth.api.getSession({
    headers: new Headers(h),
  });

  if (!session) {
    redirect("/login");
  }

  const profile = await db.query.memberProfile.findFirst({
    where: eq(memberProfile.userId, session.user.id),
    columns: { isProfileComplete: true },
  });

  const isProfileComplete = profile?.isProfileComplete ?? false;

  let destination = "/dashboard";
  if (callbackUrl && isValidRedirectPath(decodeURIComponent(callbackUrl))) {
    destination = decodeURIComponent(callbackUrl);
  }

  if (!isProfileComplete) {
    // PAUSE! Go to profile form, but keep the deep link.
    redirect(`/complete-profile?callbackUrl=${encodeURIComponent(destination)}`);
  }

  redirect(destination);
}
