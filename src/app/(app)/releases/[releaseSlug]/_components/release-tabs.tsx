"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function ReleaseTabs({ slug }: { slug: string }) {
  const pathname = usePathname();
  const tabs = [
    { href: `/releases/${slug}`, label: "OVERVIEW" },
    { href: `/releases/${slug}/assets`, label: "ASSETS" },
    { href: `/releases/${slug}/marketing`, label: "MARKETING" },
  ];
  return (
    <nav className="border-b border-line bg-page px-4 md:px-6 py-3">
      <ul className="flex flex-wrap items-center gap-1">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "bracket-text font-mono h-7 inline-flex items-center px-2 border [transition-duration:80ms]",
                  active
                    ? "bg-fg text-page border-fg"
                    : "border-line text-fg hover:border-line-strong hover:bg-surface-2",
                )}
              >
                <span className="opacity-60">[ </span>
                {t.label}
                <span className="opacity-60"> ]</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
