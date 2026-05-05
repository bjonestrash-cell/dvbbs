"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { FlightStatus } from "@/lib/supabase/types";
import type { FlightWithShow } from "@/lib/data/flights";
import { FLIGHT_STATUS_LABEL } from "@/lib/data/flights-shared";
import { STATUS_TONE } from "@/components/ui/status-bracket";
import { cn } from "@/lib/utils/cn";

/**
 * Trip timeline. Anchor-grade: hairline chips on a hairline strip, status
 * communicated via a single dot before the label, dates in mono. Hover
 * lifts the border to line-strong + soft shadow (no translate, no fill).
 *
 * Group rule: trips collapse on shared show_id, then on shared
 * confirmation_code, otherwise per-flight.
 */

type Trip = {
  key: string;
  city: string | null;
  fallbackLabel: string;
  flights: FlightWithShow[];
  startMs: number;
  endMs: number;
  primaryStatus: FlightStatus;
};

const MS_PER_DAY = 86_400_000;

const STATUS_DOT: Record<FlightStatus, string> = {
  booked: "bg-holding",
  confirmed: "bg-confirmed",
  checked_in: "bg-accent",
  completed: "bg-completed",
  cancelled: "bg-cancelled",
};

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

function fmtDateShort(ms: number): string {
  return new Date(ms)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
    })
    .replace(",", "");
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .replace(",", "");
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

function fmtDayRange(startMs: number, endMs: number): string {
  const days = Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY));
  const start = fmtDateShort(startMs);
  if (days <= 1) return start;
  return `${start} → ${fmtDateShort(endMs)}`;
}

function groupIntoTrips(flights: FlightWithShow[]): Trip[] {
  const groups = new Map<string, FlightWithShow[]>();
  for (const f of flights) {
    const key = f.show_id
      ? `show:${f.show_id}`
      : f.confirmation_code
        ? `pnr:${f.confirmation_code}`
        : `flt:${f.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(f);
  }

  const trips: Trip[] = [];
  for (const [key, fs] of groups) {
    fs.sort((a, b) => a.departure_time.localeCompare(b.departure_time));
    const startMs = new Date(fs[0].departure_time).getTime();
    const endMs = new Date(fs[fs.length - 1].arrival_time).getTime();
    const first = fs[0];
    const last = fs[fs.length - 1];
    const fallbackLabel = `${first.departure_airport} → ${last.arrival_airport}`;
    const order: FlightStatus[] = [
      "cancelled",
      "booked",
      "confirmed",
      "checked_in",
      "completed",
    ];
    const primaryStatus =
      order.find((s) => fs.some((f) => f.status === s)) ?? "booked";
    trips.push({
      key,
      city: first.show?.city ?? null,
      fallbackLabel,
      flights: fs,
      startMs,
      endMs,
      primaryStatus,
    });
  }

  return trips.sort((a, b) => a.startMs - b.startMs);
}

function assignRows(trips: Trip[]): Array<Trip & { row: number }> {
  const rowEnds: number[] = [];
  return trips.map((t) => {
    // Generous buffer because a chip is wider than a single day on the strip;
    // we want trips to drop into a new row well before they visually collide.
    const buffer = MS_PER_DAY * 6;
    let row = rowEnds.findIndex((end) => end + buffer <= t.startMs);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = t.endMs;
    return { ...t, row };
  });
}

export function TripTimeline({ flights }: { flights: FlightWithShow[] }) {
  const { positioned, rowCount, axisStartMs, axisEndMs, monthMarks } =
    useMemo(() => {
      const trips = groupIntoTrips(flights);
      if (trips.length === 0) {
        return {
          positioned: [],
          rowCount: 0,
          axisStartMs: 0,
          axisEndMs: 0,
          monthMarks: [] as Array<{ ms: number; label: string }>,
        };
      }

      const minStart = trips[0].startMs;
      const maxEnd = Math.max(...trips.map((t) => t.endMs));
      const nowMs = Date.now();

      const axisStartMs = Math.min(nowMs, minStart) - MS_PER_DAY;
      const axisEndMs = maxEnd + 7 * MS_PER_DAY;

      const positioned = assignRows(trips);
      const rowCount = Math.max(...positioned.map((p) => p.row)) + 1;

      const monthMarks: Array<{ ms: number; label: string }> = [];
      const cursor = new Date(axisStartMs);
      cursor.setUTCDate(1);
      cursor.setUTCHours(0, 0, 0, 0);
      while (cursor.getTime() <= axisEndMs) {
        if (cursor.getTime() >= axisStartMs) {
          monthMarks.push({
            ms: cursor.getTime(),
            label: cursor.toLocaleDateString("en-US", {
              month: "short",
              year: "2-digit",
            }),
          });
        }
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }

      return { positioned, rowCount, axisStartMs, axisEndMs, monthMarks };
    }, [flights]);

  if (positioned.length === 0) return null;

  const axisSpan = axisEndMs - axisStartMs;
  const pct = (ms: number) => ((ms - axisStartMs) / axisSpan) * 100;
  const todayPct = pct(Date.now());
  const todayInRange = todayPct >= 0 && todayPct <= 100;

  // Strip width scales with trip count so chips never compress past
  // legibility. 200px per trip is the working budget.
  const stripMinWidth = Math.max(720, positioned.length * 200);
  const rowHeight = 44;
  const stripHeight = rowCount * rowHeight + 8;

  return (
    <section className="px-6 md:px-10 pt-6 md:pt-8">
      <header className="flex items-baseline justify-between gap-3 pb-4">
        <div className="flex items-baseline gap-2">
          <h2
            className="font-display text-[18px] text-fg"
            style={{ fontWeight: 500 }}
          >
            Travel ahead
          </h2>
          <span className="opacity-50 font-mono text-[11px]">·</span>
          <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
            {positioned.length.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="bg-surface border border-line">
        <div className="overflow-x-auto overflow-y-visible">
          <div
            className="relative px-5 md:px-6 pt-4 pb-5"
            style={{ minWidth: stripMinWidth }}
          >
            {/* Month axis */}
            <div className="relative h-4 mb-3 select-none">
              {monthMarks.map((m) => (
                <span
                  key={m.ms}
                  className="absolute top-0 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint"
                  style={{ left: `${pct(m.ms)}%` }}
                >
                  {m.label}
                </span>
              ))}
              {todayInRange ? (
                <span
                  className="absolute top-0 font-mono uppercase tracking-[0.14em] text-[10px] text-accent"
                  style={{ left: `${todayPct}%` }}
                >
                  Today
                </span>
              ) : null}
            </div>

            {/* Strip */}
            <div className="relative" style={{ height: stripHeight }}>
              {/* Hairline baseline along the top of the strip */}
              <span
                aria-hidden
                className="absolute left-0 right-0 top-0 h-px bg-line"
              />

              {/* Faint vertical month grid */}
              {monthMarks.map((m) => (
                <span
                  key={`grid-${m.ms}`}
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-line/70"
                  style={{ left: `${pct(m.ms)}%` }}
                />
              ))}

              {/* Today line */}
              {todayInRange ? (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-accent/40"
                  style={{ left: `${todayPct}%` }}
                />
              ) : null}

              {/* Trip chips */}
              {positioned.map((t) => {
                const left = pct(t.startMs);
                const top = t.row * rowHeight + 8;
                const anchorRight = left > 80;
                return (
                  <div
                    key={t.key}
                    className="group absolute z-10 hover:z-30"
                    style={{
                      left: anchorRight ? undefined : `${left}%`,
                      right: anchorRight ? `${100 - left}%` : undefined,
                      top,
                      width: 192,
                    }}
                  >
                    <Link
                      href={`/flights/${t.flights[0].id}`}
                      aria-label={`Trip to ${t.city ?? t.fallbackLabel}`}
                      className={cn(
                        "block bg-surface border border-line",
                        "hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)]",
                        "[transition-duration:80ms]",
                      )}
                    >
                      <span className="grid grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5">
                        <span
                          aria-hidden
                          className={cn(
                            "size-1.5 rounded-full",
                            STATUS_DOT[t.primaryStatus] ?? "bg-fg-faint",
                          )}
                        />
                        <span
                          className="font-display text-[14px] text-fg leading-[1.2] truncate"
                          style={{
                            fontWeight: 500,
                            letterSpacing: "-0.005em",
                          }}
                        >
                          {t.city ? titleCase(t.city) : t.fallbackLabel}
                        </span>
                        <span className="num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint shrink-0">
                          {fmtDayRange(t.startMs, t.endMs)}
                        </span>
                      </span>
                    </Link>

                    {/* Popover. CSS-only via group-hover. Hidden on mobile
                        since :hover doesn't apply on touch — chip is the
                        link target. */}
                    <div
                      role="tooltip"
                      className={cn(
                        "hidden md:block absolute top-[calc(100%+8px)] z-40 w-[300px]",
                        "bg-surface border border-line shadow-[0_8px_24px_rgba(26,22,18,0.08)]",
                        "p-4",
                        "opacity-0 pointer-events-none [transition-duration:120ms]",
                        "group-hover:opacity-100 group-hover:pointer-events-auto",
                        anchorRight ? "right-0" : "left-0",
                      )}
                    >
                      <TripPopoverBody trip={t} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TripPopoverBody({ trip }: { trip: Trip & { row: number } }) {
  const tone = STATUS_TONE[trip.primaryStatus] ?? "default";
  return (
    <>
      <div className="flex items-baseline justify-between gap-3 pb-3 border-b border-line">
        <div className="min-w-0">
          <div className="marker">Trip</div>
          <div
            className="mt-1 font-display text-[16px] text-fg leading-[1.15] truncate"
            style={{ fontWeight: 500, letterSpacing: "-0.005em" }}
          >
            {trip.city ? titleCase(trip.city) : trip.fallbackLabel}
          </div>
        </div>
        <span className="num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint shrink-0">
          {fmtDayRange(trip.startMs, trip.endMs)}
        </span>
      </div>

      <ul className="mt-3 flex flex-col gap-3">
        {trip.flights.map((f, i) => (
          <li
            key={f.id}
            className={cn(
              "flex items-baseline justify-between gap-3",
              i > 0 ? "pt-3 border-t border-line" : "",
            )}
          >
            <div className="min-w-0">
              <span
                className="num font-display text-[14px] text-fg leading-[1.1]"
                style={{ fontWeight: 500, letterSpacing: "-0.005em" }}
              >
                {f.departure_airport}
                <span className="text-fg-faint mx-1.5 font-sans">→</span>
                {f.arrival_airport}
              </span>
              <span className="block num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-dim mt-1">
                {fmtDateTime(f.departure_time)}
              </span>
              <span className="block font-sans text-[12px] text-fg-dim truncate mt-0.5">
                {f.airline}
                {f.flight_number ? (
                  <span className="num text-fg-faint"> · {f.flight_number}</span>
                ) : null}
              </span>
            </div>
            <span className="font-mono uppercase tracking-[0.14em] text-[9px] text-fg-faint shrink-0 mt-0.5">
              {FLIGHT_STATUS_LABEL[f.status]}
            </span>
          </li>
        ))}
      </ul>
      {/* tone is referenced for type system parity though we don't render it
          here — it's already implicit in the leg statuses above. */}
      <span className="hidden">{tone}</span>
    </>
  );
}
