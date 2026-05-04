"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const VIEWS = [
  { href: "/tour", label: "LIST" },
  { href: "/tour/calendar", label: "CALENDAR" },
  { href: "/tour/map", label: "MAP" },
] as const;

export function ViewToggle() {
  const pathname = usePathname();
  return (
    <div className="inline-flex border border-line">
      {VIEWS.map((v, i) => {
        const active = pathname === v.href;
        return (
          <Link
            key={v.href}
            href={v.href}
            className={cn(
              "h-7 inline-flex items-center px-2.5 font-mono uppercase tracking-[0.08em] text-[10px] [transition-duration:80ms]",
              i > 0 && "border-l border-line",
              active
                ? "bg-fg text-page"
                : "text-fg-dim hover:bg-surface-2 hover:text-fg",
            )}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
