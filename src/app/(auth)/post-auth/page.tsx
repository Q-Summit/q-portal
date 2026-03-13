import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { buildLoginRedirect, isValidRedirectPath, safeDecodeURIComponent } from "@/lib/utils";
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
    // Pass the final destination directly to login.
    // The login page already routes through post-auth after OAuth.
    const destination =
      callbackUrl && isValidRedirectPath(callbackUrl) ? callbackUrl : "/dashboard";
    redirect(buildLoginRedirect(destination));
  }

  const profile = await db.query.memberProfile.findFirst({
    where: eq(memberProfile.userId, session.user.id),
    columns: { isProfileComplete: true },
  });

  const isProfileComplete = profile?.isProfileComplete ?? false;

  let destination = "/dashboard";
  const decodedCallback = callbackUrl ? safeDecodeURIComponent(callbackUrl) : null;
  if (decodedCallback && isValidRedirectPath(decodedCallback)) {
    destination = decodedCallback;
  }

  if (!isProfileComplete) {
    // PAUSE! Go to profile form, but keep the deep link.
    redirect(`/complete-profile?callbackUrl=${encodeURIComponent(destination)}`);
  }

  redirect(destination);
}
