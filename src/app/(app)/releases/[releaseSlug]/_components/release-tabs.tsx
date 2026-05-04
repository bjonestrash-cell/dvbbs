"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function ReleaseTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/releases/${slug}`, label: "Overview" },
    { href: `/releases/${slug}/assets`, label: "Assets" },
    { href: `/releases/${slug}/marketing`, label: "Marketing" },
  ];
  return (
    <nav className="border-b border-line bg-bg-base px-4 md:px-6">
      <ul className="flex items-center gap-1">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center px-2.5 text-xs font-medium uppercase tracking-wide border-b-2 -mb-px transition-colors",
                  active
                    ? "border-accent text-fg"
                    : "border-transparent text-fg-muted hover:text-fg",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
