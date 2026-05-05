"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plane } from "lucide-react";
import type { FlightWithShow } from "@/lib/data/flights";
import { FLIGHT_STATUS_LABEL } from "@/lib/data/flights-shared";
import { cn } from "@/lib/utils/cn";

/**
 * Trip-cascade timeline: a horizontal time strip showing every upcoming
 * trip as a small bar positioned at its dates. Trips cascade vertically
 * to avoid collisions. Hover any bar to surface the legs (route, date,
 * airline, status). Click jumps straight to the flight detail.
 *
 * "Trip" = one or more flights tied to the same show, or a standalone
 * flight pair (out + return) sharing a confirmation code.
 */

type Trip = {
  key: string;
  label: string;
  flights: FlightWithShow[];
  startMs: number;
  endMs: number;
};

const MS_PER_DAY = 86_400_000;

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

function groupIntoTrips(flights: FlightWithShow[]): Trip[] {
  // Group by show_id when present; otherwise by confirmation_code; otherwise
  // by individual flight id.
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
    const label = first.show?.city
      ? titleCase(first.show.city)
      : first.confirmation_code
        ? `${first.departure_airport} → ${last.arrival_airport}`
        : `${first.departure_airport} → ${first.arrival_airport}`;
    trips.push({ key, label, flights: fs, startMs, endMs });
  }

  return trips.sort((a, b) => a.startMs - b.startMs);
}

/** Stack trips into rows so overlapping trips don't collide. Greedy: each
 *  trip lands in the lowest row whose last-occupied end is before this
 *  trip's start. */
function assignRows(trips: Trip[]): Array<Trip & { row: number }> {
  const rowEnds: number[] = [];
  return trips.map((t) => {
    let row = rowEnds.findIndex((end) => end <= t.startMs);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = t.endMs;
    return { ...t, row };
  });
}

export function TripTimeline({ flights }: { flights: FlightWithShow[] }) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

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

      // Axis starts at today (or earlier if a trip already started) and ends
      // at the last trip's end with a 3-day buffer.
      const axisStartMs = Math.min(nowMs, minStart) - MS_PER_DAY;
      const axisEndMs = maxEnd + 3 * MS_PER_DAY;

      const positioned = assignRows(trips);
      const rowCount = Math.max(...positioned.map((p) => p.row)) + 1;

      // Month marks for the axis.
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
  const rowHeight = 26;
  const stripHeight = rowCount * rowHeight + 8;

  // "Today" marker position
  const todayPct = pct(Date.now());
  const todayInRange = todayPct >= 0 && todayPct <= 100;

  return (
    <section className="px-6 md:px-10 pt-6 md:pt-8">
      <header className="flex items-baseline justify-between gap-3 pb-3">
        <div>
          <div className="marker">Trips</div>
          <h2
            className="font-display text-[18px] text-fg mt-1"
            style={{ fontWeight: 500 }}
          >
            Travel ahead
          </h2>
        </div>
        <span className="num font-mono text-[11px] text-fg-faint">
          {positioned.length} {positioned.length === 1 ? "trip" : "trips"}
        </span>
      </header>

      <div className="bg-surface border border-line p-4 md:p-5 overflow-x-auto">
        {/* Axis row */}
        <div className="relative h-5 mb-2 select-none" style={{ minWidth: 480 }}>
          {monthMarks.map((m) => (
            <span
              key={m.ms}
              className="absolute top-0 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint"
              style={{ left: `${pct(m.ms)}%`, transform: "translateX(0%)" }}
            >
              {m.label}
            </span>
          ))}
          {todayInRange ? (
            <span
              className="absolute top-0 right-auto font-mono uppercase tracking-[0.14em] text-[10px] text-accent"
              style={{
                left: `${todayPct}%`,
                transform: "translateX(-50%)",
              }}
            >
              Today
            </span>
          ) : null}
        </div>

        {/* Cascade strip */}
        <div
          className="relative"
          style={{ height: stripHeight, minWidth: 480 }}
        >
          {/* Today vertical line */}
          {todayInRange ? (
            <span
              aria-hidden
              className="absolute top-0 bottom-0 w-px bg-accent/40"
              style={{ left: `${todayPct}%` }}
            />
          ) : null}

          {/* Month grid (faint vertical) */}
          {monthMarks.map((m) => (
            <span
              key={`grid-${m.ms}`}
              aria-hidden
              className="absolute top-0 bottom-0 w-px bg-line"
              style={{ left: `${pct(m.ms)}%` }}
            />
          ))}

          {positioned.map((t) => {
            const left = pct(t.startMs);
            const right = pct(t.endMs);
            const width = Math.max(right - left, 1.5);
            const isHovered = hoveredKey === t.key;
            const top = t.row * rowHeight + 4;

            return (
              <div
                key={t.key}
                className={cn(
                  "absolute",
                  isHovered ? "z-20" : "z-10",
                )}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                  top,
                  height: rowHeight - 6,
                }}
                onMouseEnter={() => setHoveredKey(t.key)}
                onMouseLeave={() =>
                  setHoveredKey((k) => (k === t.key ? null : k))
                }
              >
                <Link
                  href={`/flights/${t.flights[0].id}`}
                  className={cn(
                    "block h-full rounded-full border bg-surface-2 hover:bg-fg/5 [transition-property:background-color,border-color] [transition-duration:120ms]",
                    isHovered
                      ? "border-line-strong shadow-[0_4px_12px_rgba(26,22,18,0.06)]"
                      : "border-line",
                  )}
                  aria-label={`Trip to ${t.label}`}
                >
                  <span className="flex items-center gap-1.5 h-full px-2.5 min-w-0">
                    <Plane
                      className="size-3 text-fg-faint shrink-0"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="font-mono uppercase tracking-[0.06em] text-[10px] text-fg-dim truncate">
                      {t.label}
                    </span>
                  </span>
                </Link>

                {isHovered ? (
                  <TripPopover trip={t} side={left > 60 ? "left" : "right"} />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TripPopover({
  trip,
  side,
}: {
  trip: Trip & { row: number };
  side: "left" | "right";
}) {
  return (
    <div
      role="tooltip"
      className={cn(
        "absolute top-[calc(100%+8px)] z-30 w-[260px] bg-surface border border-line shadow-[0_8px_24px_rgba(26,22,18,0.10)] p-3",
        side === "left" ? "right-0" : "left-0",
      )}
    >
      <div className="flex items-baseline justify-between gap-2 pb-2 border-b border-line">
        <div className="font-display text-[14px] text-fg leading-[1.2]" style={{ fontWeight: 500 }}>
          {trip.label}
        </div>
        <span className="num font-mono text-[10px] tracking-[0.06em] uppercase text-fg-faint shrink-0">
          {fmtDateShort(trip.startMs)}
          <span className="opacity-50 mx-1">→</span>
          {fmtDateShort(trip.endMs)}
        </span>
      </div>

      <ul className="mt-2 flex flex-col gap-1.5">
        {trip.flights.map((f) => (
          <li key={f.id} className="flex items-baseline justify-between gap-3">
            <div className="min-w-0">
              <span className="num font-display text-[13px] text-fg leading-[1.1]" style={{ fontWeight: 600 }}>
                {f.departure_airport}
                <span className="opacity-50 mx-1">→</span>
                {f.arrival_airport}
              </span>
              <span className="block num font-mono text-[10px] tracking-[0.06em] uppercase text-fg-faint">
                {fmtDateTime(f.departure_time)}
              </span>
              <span className="block font-sans text-[11px] text-fg-dim truncate">
                {f.airline}
                {f.flight_number ? (
                  <span className="num text-fg-faint"> · {f.flight_number}</span>
                ) : null}
              </span>
            </div>
            <span className="font-mono uppercase tracking-[0.06em] text-[9px] text-fg-faint shrink-0">
              {FLIGHT_STATUS_LABEL[f.status].slice(0, 4)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
