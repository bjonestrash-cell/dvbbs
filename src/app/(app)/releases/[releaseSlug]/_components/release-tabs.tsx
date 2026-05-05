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
    <nav className="border-b border-line bg-page px-6 md:px-10 -mt-px">
      <ul className="flex flex-nowrap sm:flex-wrap items-center gap-6 md:gap-8 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const active = pathname === t.href;
          return (
            <li key={t.href} className="shrink-0">
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center h-11 md:h-10 font-mono uppercase tracking-[0.14em] text-[11px] [transition-duration:80ms] border-b-[1.5px]",
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
