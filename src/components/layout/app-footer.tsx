"use client";

import { Calendar, LayoutGrid, User, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/shifts", label: "Shifts", icon: Calendar },
  { href: "/profiles", label: "Members", icon: Users },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function AppFooter() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white">
      <nav className="flex items-center justify-around px-4 py-2 pb-[env(safe-area-inset-bottom)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/profile" ? pathname === "/profile" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}
