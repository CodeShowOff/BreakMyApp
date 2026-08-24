"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-neutral-950 text-neutral-300 font-sans selection:bg-violet-800/30">
      <aside className="w-64 flex flex-col border-r border-neutral-800 bg-neutral-950">
        <div className="flex h-14 items-center px-4 border-b border-neutral-800">
          <Link href="/dashboard" className="flex items-center gap-2 text-neutral-100 hover:text-white transition-colors">
            <Shield className="h-5 w-5 text-violet-800 fill-violet-800" />
            <span className="font-semibold tracking-tight text-sm uppercase tracking-widest">BreakMyApp</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 p-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-neutral-800 text-neutral-100"
                    : "text-neutral-400 hover:bg-neutral-900 hover:text-neutral-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-neutral-800">
          <div className="flex items-center gap-3">
            <UserButton appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-200">Account</span>
              <span className="text-xs text-neutral-500">Manage profile</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {children}
      </main>
    </div>
  );
}
