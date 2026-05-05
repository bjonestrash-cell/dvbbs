import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  FLIGHT_CABIN_LABEL,
  FLIGHT_STATUS_LABEL,
} from "@/lib/data/flights-shared";
import { formatMoney } from "@/lib/format";
import type { FlightWithShow } from "@/lib/data/flights";
import { cn } from "@/lib/utils/cn";

/**
 * Flight rows in the anchor (Tour List) language. Hairline cards, mono dates,
 * display num for the route, sans for the airline + flight number, status
 * dot at the right. Density target: ~64px per row on desktop.
 *
 * Replaces the prior boarding-pass treatment that broke the system with
 * 56px airport codes and a perforated divider.
 */

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return d
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
    })
    .replace(",", "");
}

function fmtDuration(depIso: string, arrIso: string): string {
  const ms = new Date(arrIso).getTime() - new Date(depIso).getTime();
  if (ms <= 0) return "";
  const totalMinutes = Math.round(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export function FlightStubList({
  flights,
  muted = false,
}: {
  flights: FlightWithShow[];
  muted?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {flights.map((f) => {
        const dep = `${fmtDate(f.departure_time)} · ${fmtTime(f.departure_time)}`;
        const dur = fmtDuration(f.departure_time, f.arrival_time);
        const cost =
          typeof f.cost === "number" && f.cost > 0
            ? formatMoney(Number(f.cost), f.currency ?? "USD")
            : "";
        return (
          <li key={f.id}>
            <Link
              href={`/flights/${f.id}`}
              className={cn(
                "block bg-surface border border-line",
                "hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]",
                muted ? "opacity-80" : "",
              )}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[160px_minmax(0,3fr)_minmax(0,0.8fr)_minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 px-3 sm:px-4 py-3 sm:py-4">
                {/* Date column (desktop) / mobile meta line */}
                <span className="num font-mono text-[12px] text-fg-dim hidden sm:inline">
                  {dep}
                </span>

                {/* Route + airline */}
                <span className="min-w-0">
                  <span className="num font-mono text-[11px] text-fg-faint sm:hidden block tracking-[0.06em]">
                    {dep}
                  </span>
                  <span className="num block font-display text-[15px] font-medium text-fg leading-[1.2] tracking-[-0.005em]">
                    {f.departure_airport}
                    <span className="text-fg-faint mx-1.5 font-sans">→</span>
                    {f.arrival_airport}
                  </span>
                  <span className="block truncate font-sans text-[13px] text-fg-dim">
                    {f.airline}
                    {f.flight_number ? (
                      <span className="num text-fg-faint"> · {f.flight_number}</span>
                    ) : null}
                    <span className="opacity-50 mx-1.5">·</span>
                    <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                      {FLIGHT_CABIN_LABEL[f.cabin]}
                    </span>
                    {f.seat ? (
                      <span className="num text-fg-faint"> · {f.seat}</span>
                    ) : null}
                  </span>
                  {/* Mobile meta line — duration + cost + show link */}
                  <span className="sm:hidden mt-1 flex flex-wrap gap-x-3 num font-mono text-[11px] text-fg-faint">
                    {dur ? <span>{dur}</span> : null}
                    {cost ? <span className="text-fg-dim">{cost}</span> : null}
                  </span>
                </span>

                {/* Duration */}
                <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                  {dur}
                </span>

                {/* Cost */}
                <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                  {cost}
                </span>

                {/* Status pill (+ optional show link) */}
                <span className="flex flex-col items-end gap-1 shrink-0 min-w-[88px] sm:min-w-[110px]">
                  <StatusBracket tone={STATUS_TONE[f.status] ?? "default"}>
                    <span className="hidden sm:inline">
                      {FLIGHT_STATUS_LABEL[f.status]}
                    </span>
                    <span className="sm:hidden">
                      {FLIGHT_STATUS_LABEL[f.status].slice(0, 4)}
                    </span>
                  </StatusBracket>
                  {f.show ? (
                    <span className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint">
                      For {titleCase(f.show.city)}
                      <ArrowRight
                        className="size-3"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </span>
                  ) : null}
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
