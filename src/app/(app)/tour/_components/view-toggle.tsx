"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const VIEWS = [
  { href: "/tour", label: "List", icon: List },
  { href: "/tour/calendar", label: "Calendar", icon: Calendar },
  { href: "/tour/map", label: "Map", icon: MapPin },
] as const;

export function ViewToggle() {
  const pathname = usePathname();
  return (
    <div className="inline-flex rounded-md border border-line bg-bg-surface p-0.5">
      {VIEWS.map((v) => {
        const active = pathname === v.href;
        const Icon = v.icon;
        return (
          <Link
            key={v.href}
            href={v.href}
            className={cn(
              "h-7 inline-flex items-center gap-1.5 rounded-sm px-2 text-xs font-medium uppercase tracking-wide transition-colors",
              active
                ? "bg-bg-elev text-fg"
                : "text-fg-muted hover:text-fg",
            )}
          >
            <Icon className="size-3" aria-hidden />
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
