"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Columns3, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const VIEWS = [
  { value: "board", label: "Board", Icon: Columns3 },
  { value: "list", label: "List", Icon: ListIcon },
] as const;

export function ReleaseViewToggle() {
  const pathname = usePathname();
  const sp = useSearchParams();
  const current: "board" | "list" = sp.get("view") === "list" ? "list" : "board";

  function hrefFor(value: string): string {
    const next = new URLSearchParams(sp);
    if (value === "board") next.delete("view");
    else next.set("view", value);
    const s = next.toString();
    return `${pathname}${s ? `?${s}` : ""}`;
  }

  return (
    <div className="inline-flex items-center gap-1">
      {VIEWS.map((v) => {
        const active = current === v.value;
        return (
          <Link
            key={v.value}
            href={hrefFor(v.value)}
            scroll={false}
            aria-current={active ? "page" : undefined}
            className={cn(
              "h-10 md:h-8 inline-flex items-center gap-1.5 px-3 rounded-full border font-mono uppercase tracking-[0.06em] text-[11px] [transition-duration:80ms]",
              active
                ? "bg-inverted text-fg-inverted border-inverted"
                : "bg-transparent border-line text-fg-dim hover:border-line-strong hover:text-fg",
            )}
          >
            <v.Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
