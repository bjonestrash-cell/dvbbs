import Link from "next/link";
import { ArrowRight, Plane } from "lucide-react";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  FLIGHT_CABIN_LABEL,
  FLIGHT_STATUS_LABEL,
} from "@/lib/data/flights-shared";
import type { FlightWithShow } from "@/lib/data/flights";
import { cn } from "@/lib/utils/cn";

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
      month: "short",
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
      {flights.map((f) => (
        <li key={f.id}>
          <Link
            href={`/flights/${f.id}`}
            className={cn(
              "block bg-surface border border-line hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]",
              muted ? "opacity-80" : "",
            )}
          >
            {/* Top row: airports + plane separator + duration / date */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-5">
              <div className="min-w-0">
                <div className="num font-display text-[26px] sm:text-[32px] leading-none tracking-[-0.02em] text-fg">
                  {f.departure_airport.toUpperCase()}
                </div>
                <div className="mt-1 num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                  {fmtDate(f.departure_time)} · {fmtTime(f.departure_time)}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <Plane
                  className="size-4 text-fg-faint"
                  strokeWidth={1.5}
                  aria-hidden
                />
                {fmtDuration(f.departure_time, f.arrival_time) ? (
                  <span className="num font-mono text-[9px] tracking-[0.06em] uppercase text-fg-faint">
                    {fmtDuration(f.departure_time, f.arrival_time)}
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 text-right">
                <div className="num font-display text-[26px] sm:text-[32px] leading-none tracking-[-0.02em] text-fg">
                  {f.arrival_airport.toUpperCase()}
                </div>
                <div className="mt-1 num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                  {fmtDate(f.arrival_time)} · {fmtTime(f.arrival_time)}
                </div>
              </div>
            </div>

            {/* Perforation */}
            <div className="mt-4 mx-4 sm:mx-6 border-t border-dashed border-line" />

            {/* Bottom row: airline + flight num + cabin / status / show link */}
            <div className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-4 sm:px-6 py-3 sm:py-4">
              <div className="min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-sans text-[14px] text-fg truncate">
                  {f.airline}
                  {f.flight_number ? (
                    <span className="ml-1.5 num font-mono text-[12px] text-fg-dim">
                      {f.flight_number}
                    </span>
                  ) : null}
                </span>
                <span className="opacity-40 hidden sm:inline">·</span>
                <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                  {FLIGHT_CABIN_LABEL[f.cabin]}
                </span>
                {f.seat ? (
                  <span className="num font-mono text-[11px] text-fg-dim">
                    {f.seat}
                  </span>
                ) : null}
              </div>
              <span className="hidden sm:flex shrink-0">
                <StatusBracket tone={STATUS_TONE[f.status] ?? "default"}>
                  {FLIGHT_STATUS_LABEL[f.status]}
                </StatusBracket>
              </span>
              <span className="sm:hidden shrink-0">
                <StatusBracket tone={STATUS_TONE[f.status] ?? "default"}>
                  {FLIGHT_STATUS_LABEL[f.status].slice(0, 4)}
                </StatusBracket>
              </span>
              {f.show ? (
                <span className="col-span-2 sm:col-span-1 sm:order-none -mt-1 sm:mt-0">
                  <span className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-dim">
                    For {titleCase(f.show.city)}
                    <ArrowRight
                      className="size-3"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                  </span>
                </span>
              ) : null}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
