import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getShow } from "@/lib/data/shows";
import {
  listTravel,
  listLodging,
  listCrew,
  listSetlist,
} from "@/lib/data/show-relations";
import { listContacts } from "@/lib/data/contacts";
import { formatDateLong, daysFromNow } from "@/lib/format";
import { AtAGlance } from "./_components/at-a-glance";
import { StatusControl } from "./_components/status-control";
import { ActivityFeed } from "./_components/activity-feed";
import { Travel } from "./_components/travel";
import { Lodging } from "./_components/lodging";
import { Crew } from "./_components/crew";
import { Setlist } from "./_components/setlist";

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

  const [travel, lodging, crew, setlist, crewContacts] = await Promise.all([
    listTravel(show.id),
    listLodging(show.id),
    listCrew(show.id),
    listSetlist(show.id),
    listContacts("crew"),
  ]);

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

        <Travel showId={show.id} travel={travel} />
        <Lodging showId={show.id} lodging={lodging} />
        <Crew showId={show.id} crew={crew} crewContacts={crewContacts} />

        <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
          <header className="mb-2">
            <div className="marker">tech</div>
            <div className="text-sm text-fg">Rider, stage plot, notes</div>
          </header>
          <p className="text-sm text-fg-muted whitespace-pre-line">
            {show.notes ?? "."}
          </p>
        </section>

        <Setlist showId={show.id} setlist={setlist} />

        <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
          <header className="mb-2">
            <div className="marker">settlement</div>
            <div className="text-sm text-fg">
              {show.status === "completed"
                ? "Reconcile this show"
                : "Available after the show"}
            </div>
          </header>
          {show.status === "completed" ? (
            <Link
              href={`/tour/${show.id}/settlement`}
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              Open settlement
            </Link>
          ) : (
            <p className="text-xs text-fg-dim">
              Mark this show completed to start reconciliation.
            </p>
          )}
        </section>

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
