import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { groupByStatus, listShows } from "@/lib/data/shows";
import { getDashboard } from "@/lib/data/dashboard";
import { formatCountdownDays, greeting as greetingPhrase } from "@/lib/format";
import type { ShowStatus } from "@/lib/supabase/types";
import { ShowFilters } from "./_components/show-filters";
import { ShowTable } from "./_components/show-table";
import { ViewToggle } from "./_components/view-toggle";
import { StatCardGrid, type StatCardItem } from "./_components/stat-card-grid";

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

  const [shows, dashboard, statusCounts, statTotals] = await Promise.all([
    listShows({
      status: status?.length ? status : undefined,
      q: sp.q || undefined,
      from: sp.from || undefined,
      to: sp.to || undefined,
    }),
    getDashboard(),
    loadStatusCounts(),
    loadStatTotals(),
  ]);

  const groups = groupByStatus(shows);

  const greetingNode = (
    <div>
      <div
        className="display-title text-fg"
        style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 300 }}
      >
        {greetingPhrase()}, Demo.
      </div>
      <div className="mt-1 font-sans text-fg-dim text-[14px]">
        {dashboard.attentionCount === 0
          ? "Nothing needs your attention right now."
          : `${dashboard.attentionCount} ${dashboard.attentionCount === 1 ? "item needs" : "items need"} your attention.`}
      </div>
    </div>
  );

  const cards: StatCardItem[] = [
    {
      id: "next",
      label: "Next show",
      value:
        dashboard.nextShow
          ? formatCountdownDays(dashboard.nextShow.date)
          : "—",
      hint: dashboard.nextShow
        ? `${toName(dashboard.nextShow.city)} · ${toName(dashboard.nextShow.venue)}`
        : "Nothing scheduled",
      tone: dashboard.nextShow ? "live" : "default",
    },
    {
      id: "confirmed90",
      label: "Confirmed 90d",
      value: statTotals.confirmed90.toString().padStart(2, "0"),
      hint: "On the books",
    },
    {
      id: "pending",
      label: "Pending offers",
      value: statTotals.pending.toString().padStart(2, "0"),
      hint: "Awaiting decision",
    },
    {
      id: "completed",
      label: "Completed",
      value: statTotals.completed.toString().padStart(2, "0"),
      hint: "Needs settlement review",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Tour"
        title="Pipeline"
        description="Source of truth for every show, lead through settlement."
        greeting={greetingNode}
        actions={
          <div className="flex items-center gap-2">
            <ViewToggle />
            <Link
              href="/tour/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              + New show
            </Link>
          </div>
        }
      />

      <div className="pt-8 md:pt-10">
        <StatCardGrid cards={cards} />
      </div>

      <div className="mt-10 md:mt-12">
        <ShowFilters counts={statusCounts} />
        <ShowTable
          groups={groups}
          empty={
            <div className="px-6 md:px-10 py-10">
              <EmptyState
                title="Nothing scheduled."
                hint="Add your first show to start the pipeline."
                action={
                  <Link
                    href="/tour/new"
                    className={buttonClasses({ variant: "primary", size: "sm" })}
                  >
                    + New show
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

function toName(s: string): string {
  return s
    .toLowerCase()
    .replace(/(^|\s|\/|,|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`)
    .replace(/\bTbd\b/g, "TBD");
}

async function loadStatTotals() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const ninetyOut = new Date(Date.now() + 90 * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const [conf90Res, pendRes, compRes] = await Promise.all([
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

  return {
    confirmed90: conf90Res.count ?? 0,
    pending: pendRes.count ?? 0,
    completed: compRes.count ?? 0,
  };
}

async function loadStatusCounts(): Promise<Partial<Record<ShowStatus, number>>> {
  const supabase = await createClient();
  const counts: Partial<Record<ShowStatus, number>> = {};
  await Promise.all(
    ALL_STATUSES.map(async (s) => {
      const { count } = await supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      counts[s] = count ?? 0;
    }),
  );
  return counts;
}
