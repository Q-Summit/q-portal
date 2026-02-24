import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function MobileLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const session = await auth.api.getSession({ headers: new Headers(h) });

  const user = session?.user ? { name: session.user.name, image: session.user.image } : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <AppHeader user={user} />
      <main className="flex-1 pb-20">{children}</main>
      <AppFooter />
    </div>
  );
}
