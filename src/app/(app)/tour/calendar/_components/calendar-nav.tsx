"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, addMonths } from "date-fns";

export function CalendarNav({ month }: { month: string }) {
  const d = parseISO(`${month}-01`);
  const prev = format(addMonths(d, -1), "yyyy-MM");
  const next = format(addMonths(d, 1), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM");

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`?month=${prev}`}
        scroll={false}
        aria-label="Previous month"
        className="size-8 grid place-items-center rounded-md border border-line bg-bg-surface transition-colors hover:border-line-strong"
      >
        <ChevronLeft className="size-4" aria-hidden />
      </Link>
      <Link
        href={`?month=${next}`}
        scroll={false}
        aria-label="Next month"
        className="size-8 grid place-items-center rounded-md border border-line bg-bg-surface transition-colors hover:border-line-strong"
      >
        <ChevronRight className="size-4" aria-hidden />
      </Link>
      <Link
        href={`?month=${today}`}
        scroll={false}
        className="h-8 inline-flex items-center rounded-md border border-line bg-bg-surface px-2.5 text-xs font-medium uppercase tracking-wide text-fg-muted transition-colors hover:border-line-strong hover:text-fg"
      >
        Today
      </Link>
    </div>
  );
}
