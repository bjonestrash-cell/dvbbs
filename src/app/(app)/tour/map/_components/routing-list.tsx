import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { StatusPill } from "@/components/ui/status-pill";
import type { Show } from "@/lib/supabase/types";
import { formatDateShort } from "@/lib/format";

export function RoutingList({
  shows,
  flags,
}: {
  shows: Show[];
  flags: Map<string, string>;
}) {
  if (shows.length === 0) {
    return (
      <p className="text-sm text-fg-muted">
        No upcoming shows. Add some via the New show button.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-1">
      {shows.map((s) => {
        const flag = flags.get(s.id);
        return (
          <li key={s.id}>
            <Link
              href={`/tour/${s.id}`}
              className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-bg-input px-3 py-2 transition-colors hover:border-line-strong"
            >
              <span className="num text-xs text-fg-muted min-w-[80px]">
                {formatDateShort(s.show_date)}
              </span>
              <span className="flex-1 min-w-0 flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-fg truncate">
                  {s.city ?? "TBD"}
                </span>
                <span className="text-xs text-fg-muted truncate">
                  {s.venue_name ?? ""}
                </span>
                {s.country ? (
                  <span className="marker">{s.country}</span>
                ) : null}
              </span>
              {flag ? (
                <span
                  className="inline-flex items-center gap-1 rounded-sm bg-status-holding/15 text-status-holding px-1.5 py-0.5 text-[11px]"
                  title={flag}
                >
                  <AlertTriangle className="size-3" aria-hidden />
                  tight
                </span>
              ) : null}
              <StatusPill status={s.status} />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
