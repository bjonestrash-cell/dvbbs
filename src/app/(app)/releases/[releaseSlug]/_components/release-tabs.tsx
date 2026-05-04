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
    <nav className="border-b border-line bg-page px-6 md:px-10">
      <ul className="flex flex-wrap items-center gap-8">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center h-10 font-mono uppercase tracking-[0.14em] text-[11px] [transition-duration:80ms] border-b",
                  active
                    ? "text-fg border-fg"
                    : "text-fg-dim border-transparent hover:text-fg",
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
