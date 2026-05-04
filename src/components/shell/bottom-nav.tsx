"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { MOBILE_NAV } from "./nav-config";
import { cn } from "@/lib/utils/cn";

export function BottomNav() {
  const pathname = usePathname();
  const items = [
    ...MOBILE_NAV,
    {
      href: "/more",
      label: "More",
      icon: MoreHorizontal,
      phase: 1 as const,
      ready: true,
      mobile: true,
      desktop: false,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-line bg-bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-bg-surface/80">
      <ul className="grid grid-cols-5 w-full">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium tracking-wide uppercase transition-colors",
                  active ? "text-fg" : "text-fg-muted",
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    active ? "text-accent" : "text-fg-muted",
                  )}
                  aria-hidden
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
