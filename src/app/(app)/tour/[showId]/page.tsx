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
import { formatDateLong, formatCountdown } from "@/lib/format";
import { AtAGlance } from "./_components/at-a-glance";
import { StatusControl } from "./_components/status-control";
import { ActivityFeed } from "./_components/activity-feed";
import { Travel } from "./_components/travel";
import { Lodging } from "./_components/lodging";
import { Crew } from "./_components/crew";
import { Setlist } from "./_components/setlist";
import { CountdownDisplay } from "./_components/countdown-display";

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

function titleCase(s: string | null): string {
  if (!s) return "TBD";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`)
    .replace(/\bTbd\b/g, "TBD");
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

  const initialCountdown = formatCountdown(show.show_date, show.set_time);
  const cityTitle = titleCase(show.city);
  const venueTitle = titleCase(show.venue_name);

  return (
    <>
      <PageHeader
        eyebrow="Tour"
        title={`${cityTitle}, ${venueTitle}`}
        description={formatDateLong(show.show_date)}
        actions={
          <Link
            href="/tour"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            All shows
          </Link>
        }
      />

      <div className="px-6 md:px-10 py-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-end gap-8">
          <StatusControl showId={show.id} status={show.status} />
          <CountdownDisplay
            date={show.show_date}
            time={show.set_time}
            initial={initialCountdown}
          />
        </div>

        <AtAGlance show={show} />

        <Travel showId={show.id} travel={travel} />
        <Lodging showId={show.id} lodging={lodging} />
        <Crew showId={show.id} crew={crew} crewContacts={crewContacts} />

        <section className="border border-line bg-surface p-6">
          <header className="mb-3">
            <div className="marker">Tech</div>
            <div className="font-sans text-[14px] text-fg mt-1">
              Rider, stage plot, notes
            </div>
          </header>
          <p className="font-sans text-[13px] text-fg-dim leading-[1.6] whitespace-pre-line">
            {show.notes ?? "No notes yet."}
          </p>
        </section>

        <Setlist showId={show.id} setlist={setlist} />

        <section className="border border-line bg-surface p-6">
          <header className="mb-3">
            <div className="marker">Settlement</div>
            <div className="font-sans text-[14px] text-fg mt-1">
              {show.status === "completed"
                ? "Reconcile this show"
                : "Available after the show"}
            </div>
          </header>
          {show.status === "completed" ? (
            <Link
              href={`/tour/${show.id}/settlement`}
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              Open settlement
            </Link>
          ) : (
            <p className="font-sans text-[13px] text-fg-dim">
              Mark this show completed to start reconciliation.
            </p>
          )}
        </section>

        <section className="border border-line bg-surface p-6">
          <header className="mb-4">
            <div className="marker">Activity</div>
            <div className="font-sans text-[14px] text-fg mt-1">
              Audit trail
            </div>
          </header>
          <ActivityFeed showId={show.id} />
        </section>
      </div>
    </>
  );
}
