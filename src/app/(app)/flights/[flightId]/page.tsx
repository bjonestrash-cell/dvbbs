import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink, Plane } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getFlight } from "@/lib/data/flights";
import { FLIGHT_CABIN_LABEL } from "@/lib/data/flights-shared";
import { formatMoney } from "@/lib/format";
import { FlightStatusControl } from "./_components/flight-status-control";
import { DeleteFlightButton } from "./_components/delete-flight-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  const f = await getFlight(flightId);
  if (!f) return { title: "Flight. DVBBS HQ" };
  return {
    title: `${f.departure_airport} → ${f.arrival_airport}. DVBBS HQ`,
  };
}

function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function fmtDate(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
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

export default async function FlightDetailPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const { flightId } = await params;
  const f = await getFlight(flightId);
  if (!f) notFound();

  const dur = fmtDuration(f.departure_time, f.arrival_time);

  return (
    <>
      <PageHeader
        eyebrow="Travel"
        title={`${f.departure_airport} → ${f.arrival_airport}`}
        description={
          f.show
            ? `For ${titleCase(f.show.city) ?? "show"}${f.show.venue_name ? ` · ${titleCase(f.show.venue_name)}` : ""}.`
            : `${f.airline}${f.flight_number ? ` ${f.flight_number}` : ""}`
        }
        actions={
          <Link
            href="/flights"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            All flights
          </Link>
        }
      />

      <div className="px-6 md:px-10 py-8 md:py-10 grid gap-6 md:gap-8 max-w-3xl">
        {/* Itinerary panel — restrained hero pair followed by KV grid. The
            airport codes sit at display 32-40 (was 56) and read as anchored
            type, not a billboard. The dashed perforation is gone; a single
            hairline divides hero from facts. */}
        <section className="bg-surface border border-line">
          <header className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-line">
            <div className="marker">Itinerary</div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-4 mt-3">
              <div className="min-w-0">
                <div
                  className="num font-display leading-none tracking-[-0.02em] text-fg"
                  style={{
                    fontSize: "clamp(28px, 6vw, 40px)",
                    fontWeight: 500,
                  }}
                >
                  {f.departure_airport.toUpperCase()}
                </div>
                <div className="mt-2 num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                  {fmtDate(f.departure_time)}
                </div>
                <div className="num font-mono text-[13px] text-fg-dim">
                  {fmtTime(f.departure_time)}
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 pb-1">
                <Plane
                  className="size-4 text-fg-faint"
                  strokeWidth={1.5}
                  aria-hidden
                />
                {dur ? (
                  <span className="num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                    {dur}
                  </span>
                ) : null}
              </div>
              <div className="min-w-0 text-right">
                <div
                  className="num font-display leading-none tracking-[-0.02em] text-fg"
                  style={{
                    fontSize: "clamp(28px, 6vw, 40px)",
                    fontWeight: 500,
                  }}
                >
                  {f.arrival_airport.toUpperCase()}
                </div>
                <div className="mt-2 num font-mono text-[10px] tracking-[0.14em] uppercase text-fg-faint">
                  {fmtDate(f.arrival_time)}
                </div>
                <div className="num font-mono text-[13px] text-fg-dim">
                  {fmtTime(f.arrival_time)}
                </div>
              </div>
            </div>
          </header>

          <dl className="grid grid-cols-2 sm:grid-cols-4 px-5 sm:px-6 py-5 gap-y-4 gap-x-4">
            <KV label="Airline" value={f.airline} />
            <KV label="Flight" value={f.flight_number ?? "—"} mono />
            <KV
              label="Confirmation"
              value={f.confirmation_code ?? "—"}
              mono
            />
            <KV label="Cabin" value={FLIGHT_CABIN_LABEL[f.cabin]} />
            <KV label="Passenger" value={f.passenger_name} />
            <KV label="Seat" value={f.seat ?? "—"} mono />
            <KV
              label="Cost"
              value={
                typeof f.cost === "number" && f.cost > 0
                  ? formatMoney(Number(f.cost), f.currency ?? "USD")
                  : "—"
              }
              mono
            />
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="label">Status</span>
              <FlightStatusControl flightId={f.id} status={f.status} />
            </div>
          </dl>
        </section>

        {/* Trip + actions */}
        <section className="border border-line bg-surface px-5 py-5 grid gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {f.ticket_url ? (
              <a
                href={f.ticket_url}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonClasses({ variant: "bracket", size: "sm" })}
              >
                <ExternalLink
                  className="size-3.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
                Open ticket
              </a>
            ) : null}
            {f.show ? (
              <Link
                href={`/tour/${f.show.id}`}
                className={buttonClasses({ variant: "bracket", size: "sm" })}
              >
                Show {titleCase(f.show.city)}
                <ArrowRight
                  className="size-3.5"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </Link>
            ) : null}
            <div className="ml-auto">
              <DeleteFlightButton flightId={f.id} />
            </div>
          </div>

          {f.notes ? (
            <div>
              <div className="marker mb-2">Notes</div>
              <p className="font-sans text-[14px] text-fg-dim leading-[1.6] whitespace-pre-line">
                {f.notes}
              </p>
            </div>
          ) : (
            <p className="font-sans text-[13px] text-fg-faint">No notes.</p>
          )}
        </section>
      </div>
    </>
  );
}

function KV({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <dt className="label">{label}</dt>
      <dd
        className={
          (mono ? "font-mono num text-[13px]" : "font-sans text-[14px]") +
          " text-fg break-words"
        }
      >
        {value}
      </dd>
    </div>
  );
}
