"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, parseISO, addMonths } from "date-fns";

export function CalendarNav({ month }: { month: string }) {
  const d = parseISO(`${month}-01`);
  const prev = format(addMonths(d, -1), "yyyy-MM");
  const next = format(addMonths(d, 1), "yyyy-MM");
  const today = format(new Date(), "yyyy-MM");

  const baseBtn =
    "inline-flex items-center justify-center border border-line bg-surface text-fg-dim hover:border-line-strong hover:text-fg [transition-duration:80ms]";

  return (
    <div className="flex items-center gap-1.5">
      <Link
        href={`?month=${prev}`}
        scroll={false}
        aria-label="Previous month"
        className={`${baseBtn} h-10 md:h-8 w-10 md:w-8`}
      >
        <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
      </Link>
      <Link
        href={`?month=${next}`}
        scroll={false}
        aria-label="Next month"
        className={`${baseBtn} h-10 md:h-8 w-10 md:w-8`}
      >
        <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
      </Link>
      <Link
        href={`?month=${today}`}
        scroll={false}
        className={`${baseBtn} h-10 md:h-8 px-3 font-mono uppercase tracking-[0.06em] text-[11px]`}
      >
        Today
      </Link>
    </div>
  );
}
