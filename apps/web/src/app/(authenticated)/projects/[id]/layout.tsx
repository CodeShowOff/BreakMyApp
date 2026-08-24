"use client";
import { use } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Layout, 
  Play, 
  Network, 
  ShieldAlert, 
  History, 
  Database, 
  Key, 
  Settings,
  BookOpen
} from "lucide-react";

const PROJECT_TABS = [
  { name: "Overview", href: "", icon: Layout },
  { name: "Run Test", href: "/run", icon: Play },
  { name: "App Model", href: "/model", icon: Network },
  { name: "Rules", href: "/rules", icon: BookOpen },
  { name: "Findings", href: "/findings", icon: ShieldAlert },
  { name: "History", href: "/history", icon: History },
  { name: "Baseline", href: "/baseline", icon: Database },
  { name: "Credentials", href: "/credentials", icon: Key },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function ProjectLayout(props: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(props.params);
  const pathname = usePathname();
  const basePath = `/projects/${unwrappedParams.id}`;

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0a0a]">
      <div className="border-b border-gray-200 dark:border-white/10 px-8 pt-8 bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Link href="/projects" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">Projects</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-200 font-medium">{unwrappedParams.id}</span>
        </div>
        
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
          {unwrappedParams.id}
        </h1>

        <nav className="flex gap-6 overflow-x-auto hide-scrollbar">
          {PROJECT_TABS.map((tab) => {
            const href = `${basePath}${tab.href}`;
            const isActive = tab.href === "" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={tab.name}
                href={href}
                className={cn(
                  "flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-gray-900 text-gray-900 dark:border-white dark:text-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-700"
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
        {props.children}
      </div>
    </div>
  );
}
