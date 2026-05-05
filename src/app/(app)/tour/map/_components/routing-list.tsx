import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { Show } from "@/lib/supabase/types";
import { formatDate, formatCapacity, formatMoney } from "@/lib/format";

const STATUS_LABEL: Record<Show["status"], string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
};

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`)
    .replace(/\bTbd\b/g, "TBD");
}

export function RoutingList({
  shows,
  flags,
}: {
  shows: Show[];
  flags: Map<string, string>;
}) {
  if (shows.length === 0) {
    return (
      <p className="px-6 md:px-10 py-12 text-center font-sans text-[13px] text-fg-faint">
        No upcoming shows. Add some via the New show button.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-2 px-6 md:px-10 py-6">
      {shows.map((s) => {
        const flag = flags.get(s.id);
        return (
          <li key={s.id}>
            <Link
              href={`/tour/${s.id}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_minmax(0,3fr)_36px_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4 bg-surface border border-line hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]"
            >
              <span className="num font-mono text-[12px] text-fg-dim hidden sm:inline">
                {formatDate(s.show_date)}
              </span>
              <span className="min-w-0">
                <span className="num font-mono text-[11px] text-fg-faint sm:hidden block">
                  {formatDate(s.show_date)}
                  {s.country ? (
                    <span className="ml-2 uppercase tracking-[0.1em] text-fg-faint">
                      {s.country.toUpperCase()}
                    </span>
                  ) : null}
                </span>
                <span className="block truncate font-sans text-[15px] font-medium text-fg">
                  {titleCase(s.city) || "TBD"}
                </span>
                <span className="block truncate font-sans text-[13px] text-fg-dim">
                  {titleCase(s.venue_name) || "Venue TBD"}
                </span>
                {flag ? (
                  <span className="mt-1 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-holding">
                    <AlertTriangle
                      className="size-3"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    {flag}
                  </span>
                ) : null}
              </span>
              <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.1em] text-fg-faint">
                {(s.country ?? "").toUpperCase()}
              </span>
              <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                {s.capacity ? formatCapacity(s.capacity) : ""}
              </span>
              <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                {formatMoney(s.fee_confirmed ?? s.fee_offered, s.currency)}
              </span>
              <span className="flex items-center justify-end shrink-0 min-w-[80px] sm:min-w-[110px]">
                <StatusBracket tone={STATUS_TONE[s.status] ?? "default"}>
                  <span className="hidden sm:inline">
                    {STATUS_LABEL[s.status]}
                  </span>
                  <span className="sm:hidden">
                    {STATUS_LABEL[s.status].slice(0, 4)}
                  </span>
                </StatusBracket>
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
