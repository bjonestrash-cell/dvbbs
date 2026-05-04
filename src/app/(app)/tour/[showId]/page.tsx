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

  return (
    <>
      <PageHeader
        eyebrow="tour show"
        title={`${show.city ?? "TBD"} / ${show.venue_name ?? "TBD"}`}
        description={formatDateLong(show.show_date)}
        actions={
          <Link
            href="/tour"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            ALL SHOWS
          </Link>
        }
      />

      <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-6">
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

        <section className="border border-line bg-surface p-4 md:p-5">
          <header className="mb-2">
            <div className="marker">TECH</div>
            <div className="text-[13px] text-fg">RIDER, STAGE PLOT, NOTES</div>
          </header>
          <p className="text-[12px] text-fg-dim whitespace-pre-line">
            {show.notes ?? "."}
          </p>
        </section>

        <Setlist showId={show.id} setlist={setlist} />

        <section className="border border-line bg-surface p-4 md:p-5">
          <header className="mb-2">
            <div className="marker">SETTLEMENT</div>
            <div className="text-[13px] text-fg">
              {show.status === "completed"
                ? "RECONCILE THIS SHOW"
                : "AVAILABLE AFTER THE SHOW"}
            </div>
          </header>
          {show.status === "completed" ? (
            <Link
              href={`/tour/${show.id}/settlement`}
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              <span className="opacity-60">[</span>OPEN SETTLEMENT<span className="opacity-60">]</span>
            </Link>
          ) : (
            <p className="text-[11px] text-fg-faint uppercase tracking-[0.08em]">
              MARK THIS SHOW COMPLETED TO START RECONCILIATION.
            </p>
          )}
        </section>

        <section className="border border-line bg-surface p-4 md:p-5">
          <header className="mb-3">
            <div className="marker">ACTIVITY</div>
            <div className="text-[13px] text-fg">AUDIT TRAIL</div>
          </header>
          <ActivityFeed showId={show.id} />
        </section>
      </div>
    </>
  );
}
