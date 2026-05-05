"use client";

import { Download } from "lucide-react";

type Row = {
  sale_date: string;
  product_name?: string | null;
  variant: string | null;
  show_label?: string | null;
  units_sold: number;
  gross: number;
  source: string;
};

function escape(s: unknown) {
  return `"${String(s ?? "").replace(/"/g, '""')}"`;
}

export function ExportCsvButton({ rows }: { rows: Row[] }) {
  function exportCsv() {
    const header = [
      "Date",
      "Product",
      "Variant",
      "Show",
      "Units",
      "Gross",
      "Source",
    ];
    const body = rows.map((r) => [
      r.sale_date,
      r.product_name ?? "",
      r.variant ?? "",
      r.show_label ?? "",
      r.units_sold,
      r.gross,
      r.source,
    ]);
    const csv = [header, ...body]
      .map((r) => r.map(escape).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `merch-sales-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  return (
    <button
      type="button"
      onClick={exportCsv}
      disabled={rows.length === 0}
      className="inline-flex h-9 items-center gap-1.5 border border-line bg-surface px-3 font-mono uppercase tracking-[0.06em] text-[11px] hover:border-line-strong [transition-duration:80ms] disabled:opacity-50"
    >
      <Download className="size-3.5" strokeWidth={1.5} aria-hidden />
      Export CSV
    </button>
  );
}
