import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusPill } from "@/components/ui/status-pill";
import { buttonClasses } from "@/components/ui/button";
import { getShow } from "@/lib/data/shows";
import {
  formatCapacity,
  formatDateLong,
  formatMoney,
  daysFromNow,
} from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const show = await getShow(showId);
  if (!show) return { title: "Show. DVBBS HQ" };
  return {
    title: `${show.city ?? "TBD"}, ${show.venue_name ?? "TBD"}. DVBBS HQ`,
  };
}

export default async function ShowPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const show = await getShow(showId);
  if (!show) notFound();

  const days = daysFromNow(show.show_date);
  const isUpcoming = days !== null && days >= 0;

  return (
    <>
      <PageHeader
        eyebrow="tour show"
        title={`${show.city ?? "TBD"}, ${show.venue_name ?? "TBD"}`}
        description={formatDateLong(show.show_date)}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/tour"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="size-4" aria-hidden />
              All shows
            </Link>
          </div>
        }
      />

      <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
        {/* Header strip */}
        <div className="flex flex-wrap items-center gap-3">
          <StatusPill status={show.status} />
          {days !== null ? (
            <div className="flex items-end gap-2">
              <span className="num text-3xl font-medium tracking-tight tabular text-fg">
                {Math.abs(days)}
              </span>
              <span className="marker pb-1">
                {isUpcoming ? "days until" : "days ago"}
              </span>
            </div>
          ) : null}
        </div>

        {/* At a glance */}
        <Section eyebrow="at a glance">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <KV label="Set time" value={show.set_time ?? "."} />
            <KV label="Doors" value={show.doors_time ?? "."} />
            <KV label="Set length" value={show.set_length_minutes ? `${show.set_length_minutes} min` : "."} />
            <KV label="Timezone" value={show.timezone ?? "."} />
            <KV label="Capacity" value={formatCapacity(show.capacity)} />
            <KV
              label="Fee"
              value={formatMoney(
                show.fee_confirmed ?? show.fee_offered,
                show.currency,
              )}
            />
            <KV
              label="Deposit"
              value={formatMoney(show.deposit_received, show.currency)}
            />
            <KV
              label="Travel"
              value={show.travel_covered ? "Covered" : "Not covered"}
            />
          </div>
        </Section>

        <PlaceholderSection eyebrow="travel" title="Flights, trains, ground" />
        <PlaceholderSection eyebrow="lodging" title="Hotel and address" />
        <PlaceholderSection eyebrow="crew" title="Who is going" />
        <PlaceholderSection eyebrow="tech" title="Rider, stage plot, notes" body={show.notes ?? "."} />
        <PlaceholderSection eyebrow="setlist" title="Track IDs played" />
        <PlaceholderSection
          eyebrow="settlement"
          title={
            show.status === "completed"
              ? "Reconcile this show"
              : "Available after the show"
          }
        />
        <PlaceholderSection eyebrow="activity" title="Audit trail" />
      </div>
    </>
  );
}

function Section({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
      <header className="mb-3 flex items-center justify-between">
        <div className="marker">{eyebrow}</div>
      </header>
      {children}
    </section>
  );
}

function PlaceholderSection({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
      <header className="mb-2">
        <div className="marker">{eyebrow}</div>
        <div className="text-sm text-fg">{title}</div>
      </header>
      {body ? (
        <p className="text-sm text-fg-muted whitespace-pre-line">{body}</p>
      ) : (
        <p className="text-xs text-fg-dim">CRUD lands in the next iteration.</p>
      )}
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="marker">{label}</span>
      <span className="num text-fg">{value}</span>
    </div>
  );
}
