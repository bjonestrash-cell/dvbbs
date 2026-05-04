import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import {
  formatCapacity,
  formatDateShort,
  formatMoney,
} from "@/lib/format";
import type { Show, ShowStatus } from "@/lib/supabase/types";

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
    <div className="border-y border-line md:rounded-md md:border md:mx-6 md:my-4 overflow-hidden">
      {Array.from(groups.entries()).map(([status, shows]) => {
        if (shows.length === 0) return null;
        return (
          <section key={status}>
            <header className="flex items-center justify-between border-b border-line bg-bg-elev/50 px-3 py-1.5">
              <div className="flex items-center gap-2">
                <span className="marker">{STATUS_LABEL[status]}</span>
                <span className="text-fg-dim text-xs num">
                  {shows.length}
                </span>
              </div>
            </header>
            <ul className="divide-y divide-line">
              {shows.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/tour/${s.id}`}
                    className="grid grid-cols-[80px_1fr_auto] md:grid-cols-[110px_minmax(0,2fr)_minmax(0,1fr)_90px_120px_60px] items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-bg-elev focus-visible:bg-bg-elev"
                  >
                    <span className="num text-fg-muted text-xs md:text-sm">
                      {formatDateShort(s.show_date)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-fg">
                        {s.city ?? "TBD"}
                      </span>
                      <span className="block truncate text-xs text-fg-muted">
                        {s.venue_name ?? "Venue TBD"}
                      </span>
                    </span>
                    <span className="hidden md:inline truncate text-xs text-fg-muted">
                      {s.country ?? ""}
                    </span>
                    <span className="hidden md:inline num text-fg-muted text-xs">
                      {formatCapacity(s.capacity)}
                    </span>
                    <span className="hidden md:inline num text-fg-muted text-xs">
                      {formatMoney(
                        s.fee_confirmed ?? s.fee_offered,
                        s.currency,
                      )}
                    </span>
                    <span className="flex items-center justify-end gap-1.5">
                      <StatusPill status={s.status} />
                      <ChevronRight
                        className="size-4 text-fg-dim hidden md:inline"
                        aria-hidden
                      />
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
