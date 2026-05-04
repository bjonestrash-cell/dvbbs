import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getShow } from "@/lib/data/shows";
import { formatDateLong, daysFromNow } from "@/lib/format";
import { AtAGlance } from "./_components/at-a-glance";
import { StatusControl } from "./_components/status-control";
import { ActivityFeed } from "./_components/activity-feed";

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
          <Link
            href="/tour"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            All shows
          </Link>
        }
      />

      <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StatusControl showId={show.id} status={show.status} />
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

        <AtAGlance show={show} />

        <PlaceholderSection eyebrow="travel" title="Flights, trains, ground" />
        <PlaceholderSection eyebrow="lodging" title="Hotel and address" />
        <PlaceholderSection eyebrow="crew" title="Who is going" />
        <PlaceholderSection
          eyebrow="tech"
          title="Rider, stage plot, notes"
          body={show.notes ?? "."}
        />
        <PlaceholderSection eyebrow="setlist" title="Track IDs played" />
        <PlaceholderSection
          eyebrow="settlement"
          title={
            show.status === "completed"
              ? "Reconcile this show"
              : "Available after the show"
          }
        />

        <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
          <header className="mb-3">
            <div className="marker">activity</div>
            <div className="text-sm text-fg">Audit trail</div>
          </header>
          <ActivityFeed showId={show.id} />
        </section>
      </div>
    </>
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
