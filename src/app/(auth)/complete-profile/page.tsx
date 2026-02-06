import { auth } from "@/lib/auth";
import { isValidRedirectPath } from "@/lib/utils";
import { db } from "@/server/db";
import { memberProfile } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import CompleteProfileForm from "./complete-profile-form";

interface CompleteProfilePageProps {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}

export default async function CompleteProfilePageWrapper(props: CompleteProfilePageProps) {
  const h = await headers();
  const { callbackUrl: rawCallbackUrl } = await props.searchParams;

  const session = await auth.api.getSession({
    headers: new Headers(h),
  });

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if profile is already complete
  const row = await db
    .select({ isProfileComplete: memberProfile.isProfileComplete })
    .from(memberProfile)
    .where(eq(memberProfile.userId, session.user.id))
    .limit(1);

  const isComplete = row[0]?.isProfileComplete ?? false;

  // 2. Resolve safe redirect URL
  let destination = "/dashboard";

  // FIX: Use rawCallbackUrl instead of the undefined 'next' variable
  if (rawCallbackUrl) {
    const decoded = decodeURIComponent(rawCallbackUrl);
    if (isValidRedirectPath(decoded)) {
      destination = decoded;
    }
  }

  // 3. If complete, forward immediately to the destination
  if (isComplete) {
    redirect(destination);
  }

  // 4. If NOT complete, pass the destination to the form so it knows where to go next
  return <CompleteProfileForm callbackUrl={destination} />;
}
