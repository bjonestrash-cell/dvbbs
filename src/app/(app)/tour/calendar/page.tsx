import Link from "next/link";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  parseISO,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { listShows } from "@/lib/data/shows";
import type { Show, ShowStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { CalendarNav } from "./_components/calendar-nav";
import { ViewToggle } from "../_components/view-toggle";
import { buttonClasses } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const metadata = { title: "Tour calendar. DVBBS HQ" };

const STATUS_BAR: Record<ShowStatus, string> = {
  lead: "bg-status-lead",
  offered: "bg-status-offered",
  holding: "bg-status-holding",
  confirmed: "bg-status-confirmed",
  contracted: "bg-status-contracted",
  completed: "bg-status-completed",
  cancelled: "bg-status-cancelled",
};

export default async function TourCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const sp = await searchParams;
  const monthParam = sp.month && /^\d{4}-\d{2}$/.test(sp.month)
    ? sp.month
    : format(new Date(), "yyyy-MM");
  const monthDate = parseISO(`${monthParam}-01`);

  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const shows = await listShows({
    from: format(gridStart, "yyyy-MM-dd"),
    to: format(gridEnd, "yyyy-MM-dd"),
  });

  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const byDay = new Map<string, Show[]>();
  for (const s of shows) {
    if (!s.show_date) continue;
    const k = s.show_date;
    if (!byDay.has(k)) byDay.set(k, []);
    byDay.get(k)!.push(s);
  }

  const today = new Date();

  return (
    <>
      <PageHeader
        eyebrow="tour calendar"
        title={format(monthDate, "LLLL yyyy")}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle />
            <CalendarNav month={monthParam} />
            <Link
              href="/tour/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              <Plus className="size-4" aria-hidden />
              New
            </Link>
          </div>
        }
      />

      <div className="px-4 md:px-6 py-4">
        <div className="grid grid-cols-7 gap-px text-xs text-fg-faint bg-line">
          {[
            ["Mon", "M"],
            ["Tue", "T"],
            ["Wed", "W"],
            ["Thu", "T"],
            ["Fri", "F"],
            ["Sat", "S"],
            ["Sun", "S"],
          ].map(([full, abbr]) => (
            <div
              key={full}
              className="bg-page px-2 py-1.5 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint text-center md:text-left"
            >
              <span className="hidden md:inline">{full}</span>
              <span className="md:hidden">{abbr}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-line border border-line rounded-md overflow-hidden">
          {days.map((d) => {
            const key = format(d, "yyyy-MM-dd");
            const dayShows = byDay.get(key) ?? [];
            const inMonth = isSameMonth(d, monthDate);
            const isToday = isSameDay(d, today);

            return (
              <div
                key={key}
                className={cn(
                  "min-h-[64px] md:min-h-28 bg-surface p-1 md:p-1.5 flex flex-col gap-1",
                  !inMonth && "bg-page/60",
                  isToday && "ring-1 ring-accent ring-inset",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-between text-[11px] num",
                    inMonth ? "text-fg-dim" : "text-fg-faint",
                    isToday && "text-accent",
                  )}
                >
                  <span>{format(d, "d")}</span>
                  {dayShows.length > 0 ? (
                    <span className="text-fg-dim">{dayShows.length}</span>
                  ) : null}
                </div>
                {/* Mobile: status dots only (one per show), tap to open. */}
                <ul className="md:hidden flex flex-wrap gap-0.5 mt-0.5">
                  {dayShows.slice(0, 6).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/tour/${s.id}`}
                        className="block size-2 rounded-full"
                        aria-label={s.city ?? s.venue_name ?? "Show"}
                      >
                        <span
                          className={cn(
                            "block size-2 rounded-full",
                            STATUS_BAR[s.status],
                          )}
                          aria-hidden
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
                {/* Desktop: titled chips. */}
                <ul className="hidden md:flex flex-col gap-0.5">
                  {dayShows.slice(0, 3).map((s) => (
                    <li key={s.id}>
                      <Link
                        href={`/tour/${s.id}`}
                        className="block truncate rounded-sm border border-line bg-surface px-1.5 py-0.5 text-[11px] text-fg hover:border-line-strong"
                      >
                        <span
                          className={cn(
                            "inline-block size-1.5 rounded-full mr-1.5 align-middle",
                            STATUS_BAR[s.status],
                          )}
                          aria-hidden
                        />
                        {s.city ?? s.venue_name ?? "TBD"}
                      </Link>
                    </li>
                  ))}
                  {dayShows.length > 3 ? (
                    <li className="text-[10px] text-fg-dim px-1.5">
                      +{dayShows.length - 3} more
                    </li>
                  ) : null}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
