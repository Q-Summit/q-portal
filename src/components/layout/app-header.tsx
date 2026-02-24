import logoImg from "@/assets/logo_blue.png";
import { User } from "lucide-react";
import Image from "next/image";

interface AppHeaderProps {
  user?: {
    name?: string | null;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-border/50 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <Image
          src={logoImg}
          alt="Q-Summit Logo"
          width={32}
          height={32}
          className="h-8 w-8 object-contain"
          priority
        />
        <span className="font-bold text-foreground">Q-Portal</span>
      </div>
      <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-200">
        {user?.image ? (
          <Image
            src={user.image}
            alt={user.name ?? "User"}
            width={32}
            height={32}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    </header>
  );
}
