"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Settings2,
  Users,
  Shield,
  CreditCard
} from "lucide-react";

const SETTINGS_TABS = [
  { name: "General", href: "/settings", icon: Settings2 },
  { name: "Team", href: "/settings/team", icon: Users },
  { name: "Audit Log", href: "/settings/audit", icon: Shield },
  { name: "Billing", href: "/settings/billing", icon: CreditCard },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-neutral-950 font-sans">
      <div className="border-b border-neutral-800 px-8 pt-8 bg-neutral-950">
        <h1 className="text-4xl font-black tracking-tighter uppercase text-white mb-6">
          Organization Settings
        </h1>

        <nav className="flex gap-8 overflow-x-auto hide-scrollbar">
          {SETTINGS_TABS.map((tab) => {
            const isActive = tab.href === "/settings" ? pathname === tab.href : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "flex items-center gap-3 pb-4 text-xs font-bold tracking-widest uppercase border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-violet-800 text-white"
                    : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {children}
      </div>
    </div>
  );
}
