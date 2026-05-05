"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { FlightStatus } from "@/lib/supabase/types";
import type { FlightWithShow } from "@/lib/data/flights";
import { FLIGHT_STATUS_LABEL } from "@/lib/data/flights-shared";
import { cn } from "@/lib/utils/cn";

/**
 * Travel ahead — agenda strip.
 *
 * Each trip is its own column with everything inline: date, city, every
 * leg with route + time + airline, status. Click navigates to the flight
 * detail. No hover popovers (they got clipped by the scroll container,
 * and they're a hostile pattern on touch anyway).
 *
 * Same horizontal scrolling layout as a split-flap airline departure
 * board. Read top-down per column, scroll left-right across trips.
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

function fmtWeekday(ms: number): string {
  return new Date(ms)
    .toLocaleDateString("en-US", { weekday: "short" })
    .toUpperCase();
}

function fmtMonthDay(ms: number): string {
  return new Date(ms)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .replace(",", "")
    .toUpperCase();
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtMonthDayShort(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .replace(",", "")
    .toUpperCase();
}

function dayCount(startMs: number, endMs: number): number {
  return Math.max(1, Math.round((endMs - startMs) / MS_PER_DAY) + 1);
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

export function TripTimeline({ flights }: { flights: FlightWithShow[] }) {
  const trips = useMemo(() => groupIntoTrips(flights), [flights]);
  if (trips.length === 0) return null;

  return (
    <section className="px-6 md:px-10 pt-6 md:pt-8">
      <header className="flex items-baseline gap-2 pb-4">
        <h2
          className="font-display text-[18px] text-fg"
          style={{ fontWeight: 500 }}
        >
          Travel ahead
        </h2>
        <span className="opacity-50 font-mono text-[11px]">·</span>
        <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
          {trips.length.toString().padStart(2, "0")}
        </span>
      </header>

      <div className="border border-line bg-surface overflow-x-auto">
        <ul className="grid grid-flow-col auto-cols-[240px] sm:auto-cols-[260px] divide-x divide-line">
          {trips.map((t) => (
            <TripCell key={t.key} trip={t} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TripCell({ trip: t }: { trip: Trip }) {
  const days = dayCount(t.startMs, t.endMs);
  const visibleLegs = t.flights.slice(0, 3);
  const overflow = t.flights.length - visibleLegs.length;

  return (
    <li>
      <Link
        href={`/flights/${t.flights[0].id}`}
        aria-label={`Trip to ${t.city ?? t.fallbackLabel}`}
        className={cn(
          "flex flex-col gap-3 h-full px-4 py-4 bg-surface",
          "hover:bg-surface-2/40 [transition-duration:80ms]",
        )}
      >
        {/* Date + duration eyebrow */}
        <div className="flex items-baseline justify-between gap-2">
          <span className="num font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
            {fmtWeekday(t.startMs)}
            <span className="opacity-50 mx-1">·</span>
            {fmtMonthDay(t.startMs)}
          </span>
          <span className="num font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
            {days === 1 ? "1d" : `${days}d`}
          </span>
        </div>

        {/* City + status dot */}
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full shrink-0 translate-y-[0.5px]",
              STATUS_DOT[t.primaryStatus] ?? "bg-fg-faint",
            )}
          />
          <h3
            className="font-display text-[18px] text-fg leading-[1.15] truncate"
            style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
          >
            {t.city ? titleCase(t.city) : t.fallbackLabel}
          </h3>
        </div>

        {/* Legs (inline, no popover). Show first 3, then "+N more". */}
        <ul className="flex flex-col gap-1.5 min-h-0">
          {visibleLegs.map((f) => (
            <li
              key={f.id}
              className="flex items-baseline justify-between gap-2 min-w-0"
            >
              <span className="num font-display text-[12px] text-fg leading-[1.1] truncate">
                {f.departure_airport}
                <span className="text-fg-faint mx-1 font-sans">→</span>
                {f.arrival_airport}
              </span>
              <span className="num font-mono text-[10px] tracking-[0.06em] text-fg-faint shrink-0">
                {fmtMonthDayShort(f.departure_time)}
                <span className="opacity-60 mx-1">·</span>
                {fmtTime(f.departure_time)}
              </span>
            </li>
          ))}
          {overflow > 0 ? (
            <li className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
              +{overflow} more
            </li>
          ) : null}
        </ul>

        {/* Status footer pinned to the bottom of the cell so footers across
            columns align horizontally. */}
        <div className="mt-auto pt-2 border-t border-line">
          <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
            {FLIGHT_STATUS_LABEL[t.primaryStatus]}
          </span>
        </div>
      </Link>
    </li>
  );
}
