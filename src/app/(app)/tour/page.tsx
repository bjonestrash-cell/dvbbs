import Link from "next/link";
import { Plus, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { groupByStatus, listShows } from "@/lib/data/shows";
import type { ShowStatus } from "@/lib/supabase/types";
import { ShowFilters } from "./_components/show-filters";
import { ShowTable } from "./_components/show-table";

export const metadata = { title: "Tour. DVBBS HQ" };

const ALL_STATUSES: ShowStatus[] = [
  "lead",
  "offered",
  "holding",
  "confirmed",
  "contracted",
  "completed",
  "cancelled",
];

export default async function TourPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const sp = await searchParams;
  const status = sp.status
    ? (sp.status.split(",").filter((s) =>
        (ALL_STATUSES as string[]).includes(s),
      ) as ShowStatus[])
    : undefined;

  const [shows, stats] = await Promise.all([
    listShows({
      status: status?.length ? status : undefined,
      q: sp.q || undefined,
      from: sp.from || undefined,
      to: sp.to || undefined,
    }),
    loadStats(),
  ]);

  const groups = groupByStatus(shows);

  return (
    <>
      <PageHeader
        eyebrow="tour"
        title="Pipeline"
        description="Source of truth for every show, lead through settlement."
        actions={
          <Link
            href="/tour/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden />
            New show
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 md:px-6 pt-4">
        <StatCard
          label="next show"
          value={stats.daysToNext === null ? "" : `${stats.daysToNext}d`}
          hint={
            stats.nextHint ?? "Nothing scheduled"
          }
          emphasis={stats.daysToNext !== null && stats.daysToNext <= 7}
        />
        <StatCard
          label="confirmed, 90d"
          value={stats.confirmed90 ?? 0}
          hint="shows on the books"
        />
        <StatCard
          label="pending offers"
          value={stats.pending ?? 0}
          hint="awaiting decision"
        />
        <StatCard
          label="completed"
          value={stats.completed ?? 0}
          hint="needs settlement review"
        />
      </div>

      <div className="mt-4">
        <ShowFilters />
        <ShowTable
          groups={groups}
          empty={
            <div className="px-4 md:px-6 py-6">
              <EmptyState
                icon={<CalendarPlus className="size-6" aria-hidden />}
                title="No shows yet."
                description="Add the first one to kick off the pipeline."
                action={
                  <Link
                    href="/tour/new"
                    className={buttonClasses({ variant: "primary", size: "sm" })}
                  >
                    <Plus className="size-4" aria-hidden />
                    New show
                  </Link>
                }
              />
            </div>
          }
        />
      </div>
    </>
  );
}

async function loadStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const ninetyOut = new Date(Date.now() + 90 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [nextRes, conf90Res, pendRes, compRes] = await Promise.all([
    supabase
      .from("shows")
      .select("id, show_date, city, venue_name, status")
      .gte("show_date", today)
      .in("status", ["confirmed", "contracted"])
      .order("show_date", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("shows")
      .select("id", { count: "exact", head: true })
      .gte("show_date", today)
      .lte("show_date", ninetyOut)
      .in("status", ["confirmed", "contracted"]),
    supabase
      .from("shows")
      .select("id", { count: "exact", head: true })
      .in("status", ["offered", "holding"]),
    supabase
      .from("shows")
      .select("id", { count: "exact", head: true })
      .eq("status", "completed"),
  ]);

  type NextShow = {
    show_date: string | null;
    city: string | null;
    venue_name: string | null;
  };
  const next = (nextRes.data as NextShow | null) ?? null;
  const daysToNext = next?.show_date
    ? Math.max(
        0,
        Math.round(
          (new Date(next.show_date).getTime() - Date.now()) / 86_400_000,
        ),
      )
    : null;
  const nextHint = next
    ? `${next.city ?? "TBD"}, ${next.venue_name ?? "TBD"}`
    : null;

  return {
    daysToNext,
    nextHint,
    confirmed90: conf90Res.count,
    pending: pendRes.count,
    completed: compRes.count,
  };
}
