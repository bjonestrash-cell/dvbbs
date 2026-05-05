import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { listFlights } from "@/lib/data/flights";
import type { FlightStatus } from "@/lib/supabase/types";
import { FlightStubList } from "./_components/flight-stub-list";
import { FlightFilters } from "./_components/flight-filters";
import { TripTimeline } from "./_components/trip-timeline";

export const metadata = { title: "Flights. DVBBS HQ" };

const ALL_STATUSES: FlightStatus[] = [
  "booked",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
];

export default async function FlightsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filterStatuses = sp.status
    ? (sp.status
        .split(",")
        .filter((s) => (ALL_STATUSES as string[]).includes(s)) as FlightStatus[])
    : [];

  const all = await listFlights();
  const q = (sp.q ?? "").trim().toLowerCase();

  const filtered = all.filter((f) => {
    if (filterStatuses.length > 0 && !filterStatuses.includes(f.status))
      return false;
    if (q) {
      const hay = [
        f.airline,
        f.flight_number ?? "",
        f.confirmation_code ?? "",
        f.departure_airport,
        f.arrival_airport,
        f.passenger_name,
        f.show?.city ?? "",
        f.show?.venue_name ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const counts: Partial<Record<FlightStatus, number>> = {};
  for (const s of ALL_STATUSES) {
    counts[s] = all.filter((f) => f.status === s).length;
  }

  // Split into "Upcoming" (departing now or later, not cancelled) and "Past".
  const now = new Date().toISOString();
  const upcoming = filtered.filter(
    (f) => f.departure_time >= now && f.status !== "cancelled",
  );
  const past = filtered
    .filter((f) => !(f.departure_time >= now && f.status !== "cancelled"))
    .reverse(); // most recent first

  return (
    <>
      <PageHeader
        eyebrow="Travel"
        title="Flights"
        description="Every leg of every trip. Quick to key in, easy to find."
        actions={
          <Link
            href="/flights/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden />
            New flight
          </Link>
        }
      />

      <FlightFilters counts={counts} total={all.length} />

      {all.length === 0 ? (
        <div className="px-6 md:px-10 py-10">
          <EmptyState
            title="No flights yet."
            hint="Add the first leg of the next trip."
            action={
              <Link
                href="/flights/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                + New flight
              </Link>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-6 md:px-10 py-10 text-center font-sans text-[13px] text-fg-faint">
          No flights match those filters.
        </div>
      ) : (
        <>
          {upcoming.length > 0 ? <TripTimeline flights={upcoming} /> : null}
          <div className="flex flex-col gap-10 px-6 md:px-10 pt-6 md:pt-8 pb-10">
            {upcoming.length > 0 ? (
              <Section title="Upcoming" count={upcoming.length}>
                <FlightStubList flights={upcoming} />
              </Section>
            ) : null}
            {past.length > 0 ? (
              <Section title="Past" count={past.length}>
                <FlightStubList flights={past} muted />
              </Section>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="flex items-baseline gap-2 pb-4">
        <h2 className="font-display text-[18px] text-fg" style={{ fontWeight: 500 }}>
          {title}
        </h2>
        <span className="opacity-50 font-mono text-[11px]">·</span>
        <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
          {count.toString().padStart(2, "0")}
        </span>
      </header>
      {children}
    </section>
  );
}
