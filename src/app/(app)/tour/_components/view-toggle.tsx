"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const VIEWS = [
  { href: "/tour", label: "List" },
  { href: "/tour/calendar", label: "Calendar" },
  { href: "/tour/map", label: "Map" },
] as const;

export function ViewToggle() {
  const pathname = usePathname();
  return (
    <div className="inline-flex items-center gap-1">
      {VIEWS.map((v) => {
        const active = pathname === v.href;
        return (
          <Link
            key={v.href}
            href={v.href}
            className={cn(
              "h-8 inline-flex items-center px-3 rounded-full border font-mono uppercase tracking-[0.06em] text-[11px] [transition-duration:80ms]",
              active
                ? "bg-inverted text-fg-inverted border-inverted"
                : "bg-transparent border-line text-fg-dim hover:border-line-strong hover:text-fg",
            )}
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
