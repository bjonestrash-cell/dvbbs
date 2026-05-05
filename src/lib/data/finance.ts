import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Show, ShowSettlement } from "@/lib/supabase/types";

type SettlementSummary = Pick<
  ShowSettlement,
  | "gross_paid"
  | "expenses_total"
  | "agent_commission"
  | "manager_commission"
  | "net_to_artist"
  | "paid_in_full"
  | "paid_date"
> | null;

export type FinanceSummary = {
  ytdGross: number;
  ytdSettled: number;
  outstanding: number;
  merchGross: number;
  outstandingShows: (Show & { settlement?: SettlementSummary })[];
  recentSettled: (Show & { settlement?: SettlementSummary })[];
};

export async function getFinanceSummary(): Promise<FinanceSummary> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  // Shows with settlement joined.
  const { data: showsRaw } = await supabase
    .from("shows")
    .select(
      "*, show_settlement!left(gross_paid, expenses_total, agent_commission, manager_commission, net_to_artist, paid_in_full, paid_date)",
    )
    .gte("show_date", yearStart)
    .lte("show_date", yearEnd)
    .order("show_date", { ascending: false, nullsFirst: false });

  type Joined = Show & {
    show_settlement?:
      | (Pick<
          ShowSettlement,
          | "gross_paid"
          | "expenses_total"
          | "agent_commission"
          | "manager_commission"
          | "net_to_artist"
          | "paid_in_full"
          | "paid_date"
        > | null)[]
      | null;
  };
  const shows = ((showsRaw as Joined[] | null) ?? []).map((row) => {
    const settlement = Array.isArray(row.show_settlement)
      ? (row.show_settlement[0] ?? null)
      : ((row.show_settlement as Joined["show_settlement"]) ?? null);
    return { ...row, settlement } as Show & {
      settlement?:
        | Pick<
            ShowSettlement,
            | "gross_paid"
            | "expenses_total"
            | "agent_commission"
            | "manager_commission"
            | "net_to_artist"
            | "paid_in_full"
            | "paid_date"
          >
        | null;
    };
  });

  let ytdGross = 0;
  let ytdSettled = 0;
  let outstanding = 0;
  const outstandingShows: typeof shows = [];
  const recentSettled: typeof shows = [];

  for (const s of shows) {
    if (
      s.status === "confirmed" ||
      s.status === "contracted" ||
      s.status === "completed"
    ) {
      ytdGross += Number(s.fee_confirmed ?? s.fee_offered ?? 0);
    }
    if (s.status === "completed") {
      const settled = s.settlement?.paid_in_full;
      if (settled && s.settlement?.net_to_artist) {
        ytdSettled += Number(s.settlement.net_to_artist);
        if (recentSettled.length < 6) recentSettled.push(s);
      } else {
        outstanding += Number(s.fee_confirmed ?? s.fee_offered ?? 0);
        outstandingShows.push(s);
      }
    }
  }

  // Merch gross YTD
  const { data: salesRaw } = await supabase
    .from("merch_sales")
    .select("gross, sale_date")
    .gte("sale_date", yearStart)
    .lte("sale_date", yearEnd);
  type SaleRow = { gross: number | string; sale_date: string };
  const merchGross = ((salesRaw as SaleRow[] | null) ?? []).reduce(
    (sum, r) => sum + Number(r.gross),
    0,
  );

  return {
    ytdGross,
    ytdSettled,
    outstanding,
    merchGross,
    outstandingShows,
    recentSettled,
  };
}

export type RevenuePoint = {
  month: string;
  tour: number;
  merch: number;
};

export async function getRevenueByMonth(): Promise<RevenuePoint[]> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;

  const [showsRes, salesRes] = await Promise.all([
    supabase
      .from("show_settlement")
      .select("paid_date, net_to_artist, paid_in_full")
      .eq("paid_in_full", true)
      .gte("paid_date", yearStart)
      .lte("paid_date", yearEnd),
    supabase
      .from("merch_sales")
      .select("gross, sale_date")
      .gte("sale_date", yearStart)
      .lte("sale_date", yearEnd),
  ]);

  type Settled = {
    paid_date: string | null;
    net_to_artist: number | string | null;
  };
  type Sale = { gross: number | string; sale_date: string };

  const map = new Map<string, { tour: number; merch: number }>();
  for (const s of (showsRes.data as Settled[] | null) ?? []) {
    if (!s.paid_date) continue;
    const month = s.paid_date.slice(0, 7);
    const cur = map.get(month) ?? { tour: 0, merch: 0 };
    cur.tour += Number(s.net_to_artist ?? 0);
    map.set(month, cur);
  }
  for (const s of (salesRes.data as Sale[] | null) ?? []) {
    const month = s.sale_date.slice(0, 7);
    const cur = map.get(month) ?? { tour: 0, merch: 0 };
    cur.merch += Number(s.gross);
    map.set(month, cur);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, d]) => ({ month, ...d }));
}
