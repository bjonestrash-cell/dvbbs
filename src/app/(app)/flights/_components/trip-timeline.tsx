"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { FlightStatus } from "@/lib/supabase/types";
import type { FlightWithShow } from "@/lib/data/flights";
import { FLIGHT_STATUS_LABEL } from "@/lib/data/flights-shared";
import { cn } from "@/lib/utils/cn";

/**
 * Trip timeline — pixel-correct edition.
 *
 * Each chip's width is proportional to the trip duration (with a sensible
 * minimum so a single-day trip is still legible). Positions and row
 * assignment are computed in pixels against an explicit strip width, so
 * chips never visually overlap their neighbors. Two trips 10 days apart
 * are visibly 10 days apart; two trips on the same week share a row only
 * if they fit, otherwise they cascade.
 *
 * Visual register: hairline rows, status as a single dot before the
 * title, dates in mono right-aligned. No tinted fills, no translate
 * hover. Same family as Tour List rows.
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

type Placed = Trip & {
  /** left edge in px from the strip start */
  leftPx: number;
  /** chip width in px (>= MIN_CHIP_PX, capped at strip remaining width) */
  widthPx: number;
  /** lane index, 0-based */
  row: number;
};

const MS_PER_DAY = 86_400_000;
/** Px per day on the strip. Tight enough for a 6-month outlook to fit
 *  before scrolling, loose enough that nearby trips don't visually
 *  collide. */
const PX_PER_DAY = 14;
/** Minimum chip width so single-day trips read cleanly. */
const MIN_CHIP_PX = 156;
/** Pixel buffer between chips on the same row. */
const ROW_GAP_PX = 12;
/** Lane height in px. Matches our row-card density (~40–44px). */
const ROW_HEIGHT = 44;
/** Vertical gap between lanes. */
const ROW_GAP_V = 8;
/** Inner horizontal padding of the strip canvas. */
const STRIP_PAD_X = 24;

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
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
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

/** Pixel-correct row assignment. Each trip lands in the lowest lane
 *  whose last-occupied pixel + ROW_GAP_PX <= this trip's left edge. */
function placeTrips(
  trips: Trip[],
  axisStartMs: number,
  pxPerMs: number,
  innerWidthPx: number,
): Placed[] {
  const rowEndsPx: number[] = [];
  const placed: Placed[] = [];

  for (const t of trips) {
    const leftPx = (t.startMs - axisStartMs) * pxPerMs;
    const durPx = (t.endMs - t.startMs) * pxPerMs;
    const idealWidth = Math.max(MIN_CHIP_PX, durPx);
    // Don't let the chip overflow the right edge.
    const maxAllowed = Math.max(MIN_CHIP_PX, innerWidthPx - leftPx);
    const widthPx = Math.min(idealWidth, maxAllowed);

    let row = rowEndsPx.findIndex(
      (rightPx) => rightPx + ROW_GAP_PX <= leftPx,
    );
    if (row === -1) row = rowEndsPx.length;
    rowEndsPx[row] = leftPx + widthPx;

    placed.push({ ...t, leftPx, widthPx, row });
  }

  return placed;
}

export function TripTimeline({ flights }: { flights: FlightWithShow[] }) {
  const layout = useMemo(() => {
    const trips = groupIntoTrips(flights);
    if (trips.length === 0) return null;

    const minStart = trips[0].startMs;
    const maxEnd = Math.max(...trips.map((t) => t.endMs));
    const nowMs = Date.now();

    // Buffer the axis: 1 day before the earliest event, 7 days after the
    // last so the rightmost chip has tail room and "Today" sits inside.
    const axisStartMs = Math.min(nowMs, minStart) - MS_PER_DAY;
    const axisEndMs = maxEnd + 7 * MS_PER_DAY;

    const axisDays = Math.ceil((axisEndMs - axisStartMs) / MS_PER_DAY);
    const innerWidthPx = Math.max(720, axisDays * PX_PER_DAY);
    const pxPerMs = innerWidthPx / (axisEndMs - axisStartMs);

    const placed = placeTrips(trips, axisStartMs, pxPerMs, innerWidthPx);
    const rowCount = Math.max(...placed.map((p) => p.row)) + 1;

    // Month marks
    const monthMarks: Array<{ ms: number; px: number; label: string }> = [];
    const cursor = new Date(axisStartMs);
    cursor.setUTCDate(1);
    cursor.setUTCHours(0, 0, 0, 0);
    while (cursor.getTime() <= axisEndMs) {
      if (cursor.getTime() >= axisStartMs) {
        const px = (cursor.getTime() - axisStartMs) * pxPerMs;
        monthMarks.push({
          ms: cursor.getTime(),
          px,
          label: cursor.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
        });
      }
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }

    const todayPx = (nowMs - axisStartMs) * pxPerMs;
    const todayInRange = todayPx >= 0 && todayPx <= innerWidthPx;

    return {
      placed,
      rowCount,
      innerWidthPx,
      monthMarks,
      todayPx,
      todayInRange,
    };
  }, [flights]);

  if (!layout) return null;

  const stripHeight = layout.rowCount * (ROW_HEIGHT + ROW_GAP_V);
  // Total scrollable canvas width = inner content + horizontal padding.
  const canvasWidth = layout.innerWidthPx + STRIP_PAD_X * 2;

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
            {layout.placed.length.toString().padStart(2, "0")}
          </span>
        </div>
      </header>

      <div className="bg-surface border border-line">
        <div className="overflow-x-auto overflow-y-visible">
          <div
            className="relative"
            style={{
              width: canvasWidth,
              minWidth: "100%",
              paddingTop: 16,
              paddingBottom: 20,
            }}
          >
            {/* Month axis. Sits just above the strip, with the same
                horizontal padding as the chip canvas so labels align with
                their respective month gridlines. */}
            <div
              className="relative h-4 select-none"
              style={{
                marginLeft: STRIP_PAD_X,
                marginRight: STRIP_PAD_X,
                width: layout.innerWidthPx,
              }}
            >
              {layout.monthMarks.map((m) => (
                <span
                  key={m.ms}
                  className="absolute top-0 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint"
                  style={{ left: m.px }}
                >
                  {m.label}
                </span>
              ))}
              {layout.todayInRange ? (
                <span
                  className="absolute top-0 font-mono uppercase tracking-[0.14em] text-[10px] text-accent"
                  style={{ left: layout.todayPx }}
                >
                  Today
                </span>
              ) : null}
            </div>

            {/* Strip with the chips, gridlines, today line. */}
            <div
              className="relative"
              style={{
                marginLeft: STRIP_PAD_X,
                marginRight: STRIP_PAD_X,
                marginTop: 12,
                width: layout.innerWidthPx,
                height: stripHeight,
              }}
            >
              {/* Hairline baseline */}
              <span
                aria-hidden
                className="absolute left-0 right-0 top-0 h-px bg-line"
              />

              {/* Vertical month gridlines */}
              {layout.monthMarks.map((m) => (
                <span
                  key={`grid-${m.ms}`}
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-line/70"
                  style={{ left: m.px }}
                />
              ))}

              {/* Today line */}
              {layout.todayInRange ? (
                <span
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-accent/40"
                  style={{ left: layout.todayPx }}
                />
              ) : null}

              {/* Trip chips */}
              {layout.placed.map((t) => {
                const top = t.row * (ROW_HEIGHT + ROW_GAP_V) + ROW_GAP_V;
                const anchorPopoverRight =
                  t.leftPx + t.widthPx > layout.innerWidthPx - 320;
                return (
                  <div
                    key={t.key}
                    className="group absolute z-10 hover:z-30"
                    style={{
                      left: t.leftPx,
                      top,
                      width: t.widthPx,
                      height: ROW_HEIGHT - ROW_GAP_V,
                    }}
                  >
                    <Link
                      href={`/flights/${t.flights[0].id}`}
                      aria-label={`Trip to ${t.city ?? t.fallbackLabel}`}
                      className={cn(
                        "block h-full bg-surface border border-line",
                        "hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)]",
                        "[transition-duration:80ms]",
                      )}
                    >
                      <span className="grid h-full grid-cols-[8px_minmax(0,1fr)_auto] items-center gap-2.5 px-3">
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

                    {/* Hover popover. CSS-only via group-hover. */}
                    <div
                      role="tooltip"
                      className={cn(
                        "hidden md:block absolute top-[calc(100%+8px)] z-40 w-[320px]",
                        "bg-surface border border-line shadow-[0_8px_24px_rgba(26,22,18,0.08)]",
                        "p-4",
                        "opacity-0 pointer-events-none [transition-duration:120ms]",
                        "group-hover:opacity-100 group-hover:pointer-events-auto",
                        anchorPopoverRight ? "right-0" : "left-0",
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

function TripPopoverBody({ trip }: { trip: Placed }) {
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

      <ul className="mt-3 flex flex-col">
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
