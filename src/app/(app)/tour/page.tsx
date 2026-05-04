import Link from "next/link";
import { Plus, CalendarPlus } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tour. DVBBS HQ" };

export default async function TourPage() {
  const supabase = await createClient();

  const today = new Date().toISOString().slice(0, 10);
  const ninetyOut = new Date(Date.now() + 90 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [
    { data: nextShow },
    { count: confirmed90 },
    { count: pending },
    { count: outstandingSettlements },
  ] = await Promise.all([
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

  const daysToNext = nextShow?.show_date
    ? Math.max(
        0,
        Math.round(
          (new Date(nextShow.show_date).getTime() - Date.now()) / 86_400_000,
        ),
      )
    : null;

  const hasShows =
    (confirmed90 ?? 0) > 0 || (pending ?? 0) > 0 || !!nextShow;

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
          value={daysToNext === null ? "" : `${daysToNext}d`}
          hint={
            nextShow
              ? `${nextShow.city ?? "TBD"}, ${nextShow.venue_name ?? "TBD"}`
              : "Nothing scheduled"
          }
          emphasis={daysToNext !== null && daysToNext <= 7}
        />
        <StatCard
          label="confirmed, 90d"
          value={confirmed90 ?? 0}
          hint="shows on the books"
        />
        <StatCard
          label="pending offers"
          value={pending ?? 0}
          hint="awaiting decision"
        />
        <StatCard
          label="completed"
          value={outstandingSettlements ?? 0}
          hint="needs settlement review"
        />
      </div>

      <div className="px-4 md:px-6 py-6">
        {hasShows ? (
          <div className="rounded-md border border-line bg-bg-surface p-6">
            <div className="marker">list view</div>
            <p className="mt-2 text-sm text-fg-muted">
              The dense table lands next. For now, use the New show button.
            </p>
          </div>
        ) : (
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
        )}
      </div>
    </>
  );
}
