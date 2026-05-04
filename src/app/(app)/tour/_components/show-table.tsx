import Link from "next/link";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  formatCapacity,
  formatDate,
  formatMoney,
} from "@/lib/format";
import type { Show, ShowStatus } from "@/lib/supabase/types";

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`)
    .replace(/\bTbd\b/g, "TBD");
}

const STATUS_LABEL: Record<ShowStatus, string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function ShowTable({
  groups,
  empty,
}: {
  groups: Map<ShowStatus, Show[]>;
  empty: React.ReactNode;
}) {
  const allEmpty = Array.from(groups.values()).every((arr) => arr.length === 0);
  if (allEmpty) return <>{empty}</>;

  return (
    <div className="divide-y divide-line border-y border-line">
      {Array.from(groups.entries()).map(([status, shows]) => {
        if (shows.length === 0) return null;
        return (
          <section key={status} className="px-6 md:px-10 py-6">
            <header className="flex items-baseline gap-2 pb-3 mb-1 border-b border-line">
              <span className="font-display text-[18px] text-fg">
                {STATUS_LABEL[status]}
              </span>
              <span className="opacity-50 font-mono text-[11px]">·</span>
              <span className="num font-mono text-[11px] tracking-[0.08em] text-fg-faint">
                {shows.length.toString().padStart(2, "0")}
              </span>
            </header>
            <ul className="divide-y divide-line">
              {shows.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/tour/${s.id}`}
                    className="grid grid-cols-[80px_1fr_auto] sm:grid-cols-[100px_minmax(0,3fr)_36px_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-4 py-5 hover:bg-surface-2 [transition-duration:80ms]"
                  >
                    <span className="num font-mono text-[12px] text-fg-dim">
                      {formatDate(s.show_date)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-sans text-[15px] font-medium text-fg">
                        {titleCase(s.city) || "TBD"}
                      </span>
                      <span className="block truncate font-sans text-[13px] text-fg-dim">
                        {titleCase(s.venue_name) || "Venue TBD"}
                      </span>
                    </span>
                    <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.1em] text-fg-faint">
                      {(s.country ?? "").toUpperCase()}
                    </span>
                    <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                      {s.capacity ? formatCapacity(s.capacity) : ""}
                    </span>
                    <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                      {formatMoney(
                        s.fee_confirmed ?? s.fee_offered,
                        s.currency,
                      )}
                    </span>
                    <span className="flex items-center justify-end shrink-0 min-w-[110px]">
                      <StatusBracket tone={STATUS_TONE[s.status] ?? "default"}>
                        {STATUS_LABEL[s.status]}
                      </StatusBracket>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
