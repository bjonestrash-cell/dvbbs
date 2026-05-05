import Link from "next/link";
import { Plus, Map as MapIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { listShows } from "@/lib/data/shows";
import type { Show } from "@/lib/supabase/types";
import { ViewToggle } from "../_components/view-toggle";
import { RoutingList } from "./_components/routing-list";
import { TourMap } from "./_components/tour-map";

export const metadata = { title: "Tour map. DVBBS HQ" };

export default async function TourMapPage() {
  const today = new Date().toISOString().slice(0, 10);
  const shows = await listShows({ from: today });
  const upcoming = shows.filter((s) =>
    ["confirmed", "contracted", "holding", "offered"].includes(s.status),
  );
  const flags = computeRoutingFlags(upcoming);
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

  return (
    <>
      <PageHeader
        eyebrow="Tour"
        title="Map"
        description="Pins for upcoming shows, tight routing flagged."
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle />
            <Link
              href="/tour/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              <Plus className="size-4" aria-hidden />
              New show
            </Link>
          </div>
        }
      />

      <div className="px-6 md:px-10 pt-6 md:pt-8">
        {mapboxToken ? (
          <TourMap shows={upcoming} token={mapboxToken} />
        ) : (
          <div className="border border-line bg-surface px-5 py-8 grid place-items-center">
            <div className="max-w-[480px] text-center">
              <MapIcon
                className="size-6 text-fg-faint mx-auto"
                strokeWidth={1.5}
                aria-hidden
              />
              <div className="mt-3 marker">Map needs a Mapbox token</div>
              <p className="mt-2 font-sans text-[13px] text-fg-dim leading-[1.6]">
                Add{" "}
                <code className="font-mono text-[12px] text-fg">
                  NEXT_PUBLIC_MAPBOX_TOKEN
                </code>{" "}
                to <code className="font-mono text-[12px] text-fg">.env.local</code>{" "}
                and Netlify to enable the world map.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 md:mt-10">
        <div className="px-6 md:px-10 pb-2 flex items-baseline justify-between gap-3">
          <div>
            <div className="marker">Routing</div>
            <h2 className="font-display text-[18px] text-fg mt-1">
              Upcoming shows
            </h2>
          </div>
          <span className="num font-mono text-[11px] text-fg-faint">
            {upcoming.length} on the board
            {flags.size ? ` · ${flags.size} flagged` : ""}
          </span>
        </div>
        <RoutingList shows={upcoming} flags={flags} />
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
