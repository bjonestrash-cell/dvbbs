import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { listAllSales } from "@/lib/data/merch";
import {
  formatDateCompact,
  formatMoney,
} from "@/lib/format";
import { SalesByMonthChart } from "./_components/sales-by-month-chart";
import { ExportCsvButton } from "./_components/export-csv";
import { MERCH_SALE_SOURCE_LABEL } from "@/lib/data/merch-shared";

export const metadata = { title: "Merch sales. DVBBS HQ" };

export default async function MerchSalesPage() {
  const sales = await listAllSales();

  // Aggregate
  const byMonth = aggregateMonths(sales);
  const byShow = aggregateShows(sales);
  const topSku = aggregateProducts(sales).slice(0, 8);

  const totalUnits = sales.reduce((sum, s) => sum + s.units_sold, 0);
  const totalGross = sales.reduce((sum, s) => sum + Number(s.gross), 0);

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Sales"
        description="Where the merch goes, by show, by month, by SKU."
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton rows={sales} />
            <Link
              href="/merch"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
              All products
            </Link>
          </div>
        }
      />

      <div className="px-6 md:px-10 py-8 grid gap-10">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
          <Stat label="Total gross" value={formatMoney(totalGross, "USD")} />
          <Stat label="Total units" value={totalUnits.toString()} />
          <Stat
            label="Avg per sale"
            value={
              sales.length > 0
                ? formatMoney(Math.round(totalGross / sales.length), "USD")
                : "—"
            }
          />
          <Stat
            label="Sale count"
            value={sales.length.toString().padStart(2, "0")}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="border border-line bg-surface p-5">
            <header className="mb-3">
              <div className="marker">By month, gross</div>
              <h2 className="font-display text-[18px] text-fg mt-1">
                Revenue trend
              </h2>
            </header>
            <SalesByMonthChart data={byMonth} metric="gross" />
          </section>
          <section className="border border-line bg-surface p-5">
            <header className="mb-3">
              <div className="marker">By month, units</div>
              <h2 className="font-display text-[18px] text-fg mt-1">
                Volume trend
              </h2>
            </header>
            <SalesByMonthChart data={byMonth} metric="units" />
          </section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="border border-line bg-surface">
            <header className="px-5 py-4 border-b border-line">
              <div className="marker">By show</div>
              <h2 className="font-display text-[18px] text-fg mt-1">
                Tour revenue
              </h2>
            </header>
            {byShow.length === 0 ? (
              <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
                No tour-attached sales yet.
              </p>
            ) : (
              <ul>
                {byShow.map((s, i) => (
                  <li
                    key={s.label}
                    className={
                      "grid grid-cols-[1fr_80px_120px] items-center gap-3 px-5 py-3 " +
                      (i < byShow.length - 1 ? "border-b border-line" : "")
                    }
                  >
                    <span className="font-sans text-[13px] text-fg truncate">
                      {s.label}
                    </span>
                    <span className="num font-mono text-[12px] text-fg-dim text-right">
                      {s.units}
                    </span>
                    <span className="num font-mono text-[12px] text-fg text-right">
                      {formatMoney(s.gross, "USD")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="border border-line bg-surface">
            <header className="px-5 py-4 border-b border-line">
              <div className="marker">Top SKUs</div>
              <h2 className="font-display text-[18px] text-fg mt-1">
                What's selling
              </h2>
            </header>
            {topSku.length === 0 ? (
              <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
                No sales yet.
              </p>
            ) : (
              <ul>
                {topSku.map((s, i) => {
                  const max = topSku[0].gross;
                  const pct = max > 0 ? (s.gross / max) * 100 : 0;
                  return (
                    <li
                      key={s.label}
                      className={
                        "grid grid-cols-[1fr_60px_100px] items-center gap-3 px-5 py-3 " +
                        (i < topSku.length - 1 ? "border-b border-line" : "")
                      }
                    >
                      <span className="font-sans text-[13px] text-fg truncate">
                        {s.label}
                      </span>
                      <span className="h-[2px] bg-surface-2 relative overflow-hidden">
                        <span
                          className="absolute left-0 top-0 h-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="num font-mono text-[12px] text-fg text-right">
                        {formatMoney(s.gross, "USD")}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <section className="border border-line bg-surface">
          <header className="px-5 py-4 border-b border-line">
            <div className="marker">Recent sales</div>
            <h2 className="font-display text-[18px] text-fg mt-1">
              Last 30 records
            </h2>
          </header>
          {sales.length === 0 ? (
            <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
              Record your first sale.
            </p>
          ) : (
            <ul>
              <li className="hidden sm:grid grid-cols-[100px_1fr_1fr_80px_120px_100px] items-center gap-4 px-5 py-2.5 border-b border-line">
                <span className="label">Date</span>
                <span className="label">Product</span>
                <span className="label">Show</span>
                <span className="label text-right">Units</span>
                <span className="label text-right">Gross</span>
                <span className="label">Source</span>
              </li>
              {sales.slice(0, 30).map((s, i, arr) => (
                <li
                  key={s.id}
                  className={
                    "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_1fr_1fr_80px_120px_100px] items-center gap-x-3 gap-y-1 sm:gap-4 px-5 py-3 " +
                    (i < arr.length - 1 ? "border-b border-line" : "")
                  }
                >
                  <div className="min-w-0 flex flex-col gap-0.5 sm:contents">
                    <span className="num font-mono text-[11px] sm:text-[12px] text-fg-dim">
                      {formatDateCompact(s.sale_date)}
                    </span>
                    <span className="font-sans text-[13px] text-fg truncate">
                      {s.product_name ?? "—"}
                      {s.variant ? (
                        <span className="text-fg-faint"> · {s.variant}</span>
                      ) : null}
                    </span>
                    <span className="sm:hidden text-fg-faint font-sans text-[12px] truncate">
                      {s.show_label ?? ""}
                    </span>
                  </div>
                  <span className="sm:hidden self-start num font-mono text-[12px] text-fg text-right">
                    {formatMoney(Number(s.gross), "USD")}
                  </span>
                  <span className="hidden sm:inline font-sans text-[12px] text-fg-dim truncate">
                    {s.show_label ?? "—"}
                  </span>
                  <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                    {s.units_sold}
                  </span>
                  <span className="hidden sm:inline num font-mono text-[12px] text-fg text-right">
                    {formatMoney(Number(s.gross), "USD")}
                  </span>
                  <span className="hidden sm:inline font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint">
                    {MERCH_SALE_SOURCE_LABEL[s.source]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface p-5">
      <div className="marker">{label}</div>
      <div
        className="mt-2 display-stat tabular text-fg"
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

type SaleRow = Awaited<ReturnType<typeof listAllSales>>[number];

function aggregateMonths(rows: SaleRow[]) {
  const byMonth = new Map<string, { units: number; gross: number }>();
  for (const r of rows) {
    const month = r.sale_date.slice(0, 7);
    const cur = byMonth.get(month) ?? { units: 0, gross: 0 };
    cur.units += r.units_sold;
    cur.gross += Number(r.gross);
    byMonth.set(month, cur);
  }
  return Array.from(byMonth.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, ...d }));
}

function aggregateShows(rows: SaleRow[]) {
  const byShow = new Map<string, { label: string; units: number; gross: number }>();
  for (const r of rows) {
    if (!r.show_label) continue;
    const cur = byShow.get(r.show_label) ?? {
      label: r.show_label,
      units: 0,
      gross: 0,
    };
    cur.units += r.units_sold;
    cur.gross += Number(r.gross);
    byShow.set(r.show_label, cur);
  }
  return Array.from(byShow.values()).sort((a, b) => b.gross - a.gross);
}

function aggregateProducts(rows: SaleRow[]) {
  const byProduct = new Map<
    string,
    { label: string; units: number; gross: number }
  >();
  for (const r of rows) {
    const key = r.product_name ?? "Unknown";
    const cur = byProduct.get(key) ?? { label: key, units: 0, gross: 0 };
    cur.units += r.units_sold;
    cur.gross += Number(r.gross);
    byProduct.set(key, cur);
  }
  return Array.from(byProduct.values()).sort((a, b) => b.gross - a.gross);
}
