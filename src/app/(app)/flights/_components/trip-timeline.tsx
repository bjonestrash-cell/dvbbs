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
 * Each trip is its own column, separated by hairline dividers, scrolling
 * horizontally on overflow. One column per trip, sized identically, in
 * chronological order — no Gantt-style date scaling, no row stacking, no
 * collision math. Reads like a split-flap airline departure board.
 *
 * Status communicated as a single dot before the city, never as a fill.
 * Hover popover (desktop) reveals every leg with date + airline.
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

      <div className="border border-line bg-surface overflow-x-auto overflow-y-visible">
        <ul className="grid grid-flow-col auto-cols-[200px] sm:auto-cols-[220px] divide-x divide-line">
          {trips.map((t, i) => (
            <TripCell key={t.key} trip={t} columnIndex={i} total={trips.length} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function TripCell({
  trip: t,
  columnIndex,
  total,
}: {
  trip: Trip;
  columnIndex: number;
  total: number;
}) {
  const days = dayCount(t.startMs, t.endMs);
  // Anchor popover to the right when this trip is in the rightmost ~30% of
  // the strip so the popover never runs off canvas.
  const anchorRight = total >= 4 && columnIndex >= total - 2;
  const legs = t.flights.length;

  return (
    <li className="group relative">
      <Link
        href={`/flights/${t.flights[0].id}`}
        aria-label={`Trip to ${t.city ?? t.fallbackLabel}`}
        className={cn(
          "flex flex-col gap-3 h-full px-4 py-4 bg-surface",
          "hover:bg-surface-2/40 [transition-duration:80ms]",
        )}
      >
        {/* Date eyebrow */}
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
              "size-1.5 rounded-full shrink-0",
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

        {/* Meta */}
        <div className="mt-auto flex flex-col gap-0.5">
          <span className="font-sans text-[12px] text-fg-dim truncate">
            {legs} {legs === 1 ? "leg" : "legs"}
            {!t.city ? null : (
              <>
                <span className="opacity-50 mx-1.5">·</span>
                <span className="num font-mono text-fg-faint">
                  {t.flights[0].departure_airport}
                  <span className="opacity-50 mx-1">→</span>
                  {t.flights[t.flights.length - 1].arrival_airport}
                </span>
              </>
            )}
          </span>
          <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
            {FLIGHT_STATUS_LABEL[t.primaryStatus]}
          </span>
        </div>
      </Link>

      {/* Hover popover (desktop only). CSS-only via group-hover. */}
      <div
        role="tooltip"
        className={cn(
          "hidden md:block absolute top-[calc(100%+8px)] z-40 w-[320px]",
          "bg-surface border border-line shadow-[0_8px_24px_rgba(26,22,18,0.08)] p-4",
          "opacity-0 pointer-events-none [transition-duration:120ms]",
          "group-hover:opacity-100 group-hover:pointer-events-auto",
          anchorRight ? "right-0" : "left-0",
        )}
      >
        <TripPopoverBody trip={t} />
      </div>
    </li>
  );
}

function TripPopoverBody({ trip }: { trip: Trip }) {
  const days = dayCount(trip.startMs, trip.endMs);
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
          {fmtMonthDay(trip.startMs)}
          {days > 1 ? (
            <>
              <span className="opacity-50 mx-1">→</span>
              {fmtMonthDay(trip.endMs)}
            </>
          ) : null}
        </span>
      </div>

      <ul className="mt-1">
        {trip.flights.map((f, i) => (
          <li
            key={f.id}
            className={cn(
              "flex items-baseline justify-between gap-3 py-3",
              i > 0 ? "border-t border-line" : "",
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
    </>
  );
}
