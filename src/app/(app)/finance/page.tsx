import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { getFinanceSummary, getRevenueByMonth } from "@/lib/data/finance";
import { formatDate, formatMoney } from "@/lib/format";
import { RevenueChart } from "./_components/revenue-chart";

export const metadata = { title: "finance" };

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export default async function FinancePage() {
  const [summary, revenueByMonth] = await Promise.all([
    getFinanceSummary(),
    getRevenueByMonth(),
  ]);
  const year = new Date().getFullYear();

  return (
    <>
      <PageHeader
        eyebrow="Finance"
        title="Money"
        description={`Bookings, settlements, merch. Year-to-date for ${year}.`}
      />

      <div className="px-6 md:px-10 py-8 grid gap-10">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          <Stat
            label="Tour gross, ytd"
            value={formatMoney(summary.ytdGross, "USD")}
          />
          <Stat
            label="Settled, ytd"
            value={formatMoney(summary.ytdSettled, "USD")}
          />
          <Stat
            label="Outstanding"
            value={formatMoney(summary.outstanding, "USD")}
            tone={summary.outstanding > 0 ? "warn" : undefined}
          />
          <Stat
            label="Merch gross, ytd"
            value={formatMoney(summary.merchGross, "USD")}
          />
        </section>

        <section className="border border-line bg-surface p-5 md:p-6">
          <header className="mb-3">
            <div className="marker">By month</div>
            <h2 className="font-display text-[20px] text-fg mt-1">
              Tour and merch revenue
            </h2>
          </header>
          <RevenueChart data={revenueByMonth} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section className="border border-line bg-surface">
            <header className="px-5 py-4 border-b border-line flex items-baseline justify-between gap-2">
              <div>
                <div className="marker">Outstanding</div>
                <h2 className="font-display text-[18px] text-fg mt-1">
                  Completed shows, unpaid
                </h2>
              </div>
              <span className="num font-mono text-[11px] text-fg-faint">
                {summary.outstandingShows.length}
              </span>
            </header>
            {summary.outstandingShows.length === 0 ? (
              <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
                Nothing to chase. All settled.
              </p>
            ) : (
              <ul>
                {summary.outstandingShows.map((s, i) => (
                  <li
                    key={s.id}
                    className={
                      "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[1fr_120px_auto] items-center gap-x-3 gap-y-1 px-5 py-3 hover:bg-surface-2 [transition-duration:80ms] " +
                      (i < summary.outstandingShows.length - 1
                        ? "border-b border-line"
                        : "")
                    }
                  >
                    <Link
                      href={`/tour/${s.id}/settlement`}
                      className="min-w-0 font-sans text-[14px] text-fg hover:text-accent [transition-duration:80ms]"
                    >
                      <span className="block truncate">
                        {titleCase(s.city)}
                        <span className="text-fg-dim">
                          {" · "}
                          {titleCase(s.venue_name)}
                        </span>
                      </span>
                      <span className="num font-mono text-[11px] text-fg-faint">
                        {formatDate(s.show_date)}
                      </span>
                    </Link>
                    <span className="num font-mono text-[13px] text-fg text-right self-start sm:self-center">
                      {formatMoney(
                        s.fee_confirmed ?? s.fee_offered,
                        s.currency,
                      )}
                    </span>
                    <Link
                      href={`/tour/${s.id}/settlement`}
                      className="col-span-2 sm:col-span-1 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-dim hover:text-fg [transition-duration:80ms]"
                    >
                      Reconcile
                      <ArrowRight
                        className="size-3"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-line bg-surface">
            <header className="px-5 py-4 border-b border-line flex items-baseline justify-between gap-2">
              <div>
                <div className="marker">Recently settled</div>
                <h2 className="font-display text-[18px] text-fg mt-1">
                  Money in
                </h2>
              </div>
              <span className="num font-mono text-[11px] text-fg-faint">
                {summary.recentSettled.length}
              </span>
            </header>
            {summary.recentSettled.length === 0 ? (
              <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
                No settled shows this year yet.
              </p>
            ) : (
              <ul>
                {summary.recentSettled.map((s, i) => (
                  <li
                    key={s.id}
                    className={
                      "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[1fr_120px_auto] items-center gap-x-3 gap-y-1 px-5 py-3 hover:bg-surface-2 [transition-duration:80ms] " +
                      (i < summary.recentSettled.length - 1
                        ? "border-b border-line"
                        : "")
                    }
                  >
                    <Link
                      href={`/tour/${s.id}/settlement`}
                      className="min-w-0 font-sans text-[14px] text-fg hover:text-accent [transition-duration:80ms]"
                    >
                      <span className="block truncate">
                        {titleCase(s.city)}
                        <span className="text-fg-dim">
                          {" · "}
                          {titleCase(s.venue_name)}
                        </span>
                      </span>
                      {s.settlement?.paid_date ? (
                        <span className="num font-mono text-[11px] text-fg-faint">
                          paid {formatDate(s.settlement.paid_date)}
                        </span>
                      ) : null}
                    </Link>
                    <span className="num font-mono text-[13px] text-fg text-right self-start sm:self-center">
                      {formatMoney(
                        s.settlement?.net_to_artist,
                        s.currency,
                      )}
                    </span>
                    <Link
                      href={`/tour/${s.id}/settlement`}
                      className="col-span-2 sm:col-span-1 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-dim hover:text-fg [transition-duration:80ms]"
                    >
                      View
                      <ArrowRight
                        className="size-3"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {summary.ytdGross === 0 && summary.merchGross === 0 ? (
          <EmptyState
            title="Nothing to total yet."
            hint="Confirm a show or record a sale and the numbers will populate here."
          />
        ) : null}
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="bg-surface p-5">
      <div className="marker">{label}</div>
      <div
        className={
          "mt-2 display-stat tabular " +
          (tone === "warn" ? "text-holding" : "text-fg")
        }
        style={{
          fontSize: "clamp(24px, 3vw, 32px)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
    </div>
  );
}
