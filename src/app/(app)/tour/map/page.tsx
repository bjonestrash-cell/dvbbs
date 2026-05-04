import Link from "next/link";
import { Plus, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { listShows } from "@/lib/data/shows";
import type { Show } from "@/lib/supabase/types";
import { ViewToggle } from "../_components/view-toggle";
import { RoutingList } from "./_components/routing-list";

export const metadata = { title: "Tour map. DVBBS HQ" };

export default async function TourMapPage() {
  const today = new Date().toISOString().slice(0, 10);
  const shows = await listShows({ from: today });
  const upcoming = shows.filter((s) =>
    ["confirmed", "contracted", "holding", "offered"].includes(s.status),
  );
  const flags = computeRoutingFlags(upcoming);
  const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <>
      <PageHeader
        eyebrow="tour map"
        title="World routing"
        description="Pins for upcoming shows, tight routing flagged."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle />
            <Link
              href="/tour/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              <Plus className="size-4" aria-hidden />
              New
            </Link>
          </div>
        }
      />

      <div className="px-4 md:px-6 py-4 grid gap-4">
        {!hasMapbox ? (
          <div className="rounded-md border border-line bg-bg-surface p-4">
            <div className="marker">map</div>
            <h2 className="mt-1 text-base font-medium flex items-center gap-2">
              <MapIcon className="size-4 text-fg-muted" aria-hidden />
              Map needs Mapbox token
            </h2>
            <p className="mt-2 max-w-prose text-sm text-fg-muted">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local and Netlify to enable
              the world map. Until then, the routing list below is the live
              picture.
            </p>
          </div>
        ) : null}

        <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
          <header className="mb-3 flex items-center justify-between">
            <div>
              <div className="marker">routing</div>
              <div className="text-sm text-fg">
                Upcoming shows ordered by date
              </div>
            </div>
            <span className="num text-xs text-fg-muted">
              {upcoming.length} on the board, {flags.size} flagged
            </span>
          </header>
          <RoutingList shows={upcoming} flags={flags} />
        </section>
      </div>
    </>
  );
}

function computeRoutingFlags(shows: Show[]): Map<string, string> {
  const flags = new Map<string, string>();
  const sorted = [...shows].sort((a, b) => {
    const ad = a.show_date ?? "";
    const bd = b.show_date ?? "";
    return ad.localeCompare(bd);
  });

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (!prev.show_date || !curr.show_date) continue;
    const prevSet = combine(prev.show_date, prev.set_time);
    const currSet = combine(curr.show_date, curr.set_time);
    if (!prevSet || !currSet) continue;
    const gapHours = (currSet.getTime() - prevSet.getTime()) / 3_600_000;
    if (
      gapHours < 24 &&
      prev.country &&
      curr.country &&
      prev.country !== curr.country
    ) {
      flags.set(
        curr.id,
        `Only ${gapHours.toFixed(0)}h after ${prev.city}, ${prev.country}.`,
      );
    }
  }
  return flags;
}

function combine(date: string, time: string | null): Date | null {
  const t = time ?? "21:00";
  try {
    return new Date(`${date}T${t}:00`);
  } catch {
    return null;
  }
}
