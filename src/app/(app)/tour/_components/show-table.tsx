import Link from "next/link";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  formatCapacity,
  formatDate,
  formatMoney,
} from "@/lib/format";
import type { Show, ShowStatus } from "@/lib/supabase/types";

const STATUS_LABEL: Record<ShowStatus, string> = {
  lead: "LEAD",
  offered: "OFFERED",
  holding: "HOLDING",
  confirmed: "CONFIRMED",
  contracted: "CONTRACTED",
  completed: "COMPLETED",
  cancelled: "CANCELLED",
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
    <div className="border-y border-line md:border-x md:mx-6 md:my-4">
      {Array.from(groups.entries()).map(([status, shows]) => {
        if (shows.length === 0) return null;
        return (
          <section key={status}>
            <header className="flex items-center gap-2 px-4 md:px-3 pt-8 pb-2 first-of-type:pt-4">
              <span className="font-mono uppercase tracking-[0.08em] text-[11px] text-fg-dim">
                {STATUS_LABEL[status]}
              </span>
              <span className="text-fg-faint">/</span>
              <span className="num text-[11px] text-fg-faint">
                {shows.length.toString().padStart(2, "0")}
              </span>
            </header>
            <div className="border-t border-line">
              <ul>
                {shows.map((s) => (
                  <li key={s.id} className="border-b border-line last:border-b-0">
                    <Link
                      href={`/tour/${s.id}`}
                      className="grid grid-cols-[88px_1fr_auto] sm:grid-cols-[120px_minmax(0,2fr)_36px_minmax(70px,80px)_120px_110px] items-center gap-3 px-4 md:px-3 py-3 hover:bg-surface [transition-duration:80ms]"
                    >
                      <span className="num font-mono text-[11px] text-fg-dim uppercase tracking-[0.06em]">
                        {formatDate(s.show_date)}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-mono text-[12px] text-fg">
                          {(s.city ?? "TBD").toUpperCase()}
                        </span>
                        <span className="block truncate font-mono text-[11px] text-fg-dim">
                          {(s.venue_name ?? "Venue TBD").toUpperCase()}
                        </span>
                      </span>
                      <span className="hidden sm:inline font-mono text-[11px] text-fg-faint">
                        {(s.country ?? "").toUpperCase()}
                      </span>
                      <span className="hidden sm:inline num font-mono text-[11px] text-fg-dim">
                        {s.capacity ? formatCapacity(s.capacity) : "."}
                      </span>
                      <span className="hidden sm:inline num font-mono text-[11px] text-fg-dim">
                        {formatMoney(
                          s.fee_confirmed ?? s.fee_offered,
                          s.currency,
                        )}
                      </span>
                      <span className="flex items-center justify-end">
                        <StatusBracket tone={STATUS_TONE[s.status] ?? "default"}>
                          {STATUS_LABEL[s.status]}
                        </StatusBracket>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </div>
  );
}
