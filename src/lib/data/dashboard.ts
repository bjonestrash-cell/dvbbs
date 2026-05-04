import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type DashboardSnapshot = {
  nextShow: {
    city: string;
    venue: string;
    date: string;
    time: string | null;
    label: string;
  } | null;
  onTheRoadDays: number;
  attentionCount: number;
};

/** Compute the personalized header status data. Memoized per request. */
export const getDashboard = cache(async (): Promise<DashboardSnapshot> => {
  const supabase = await createClient();
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const year = now.getFullYear();
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const fourteenDaysAgoIso = new Date(
    Date.now() - 14 * 86_400_000,
  ).toISOString();

  const [nextRes, onRoadRes, offersRes, holdingRes, leadsRes, completedRes] =
    await Promise.all([
      supabase
        .from("shows")
        .select("show_date, set_time, city, venue_name")
        .gte("show_date", todayIso)
        .in("status", ["confirmed", "contracted"])
        .order("show_date", { ascending: true })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .gte("show_date", yearStart)
        .lte("show_date", yearEnd)
        .in("status", ["confirmed", "contracted", "completed"]),
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("status", "offered"),
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("status", "holding"),
      supabase
        .from("shows")
        .select("id", { count: "exact", head: true })
        .eq("status", "lead")
        .lt("created_at", fourteenDaysAgoIso),
      supabase
        .from("shows")
        .select("id, show_settlement(paid_in_full)")
        .eq("status", "completed")
        .gte("show_date", `${year - 1}-01-01`),
    ]);

  type CompletedRow = {
    id: string;
    show_settlement?:
      | { paid_in_full: boolean | null }
      | { paid_in_full: boolean | null }[]
      | null;
  };
  const completed = ((completedRes.data as CompletedRow[] | null) ?? []).filter(
    (r) => {
      const s = Array.isArray(r.show_settlement)
        ? r.show_settlement[0]
        : r.show_settlement;
      return !s || !s.paid_in_full;
    },
  ).length;

  type NextRow = {
    show_date: string | null;
    set_time: string | null;
    city: string | null;
    venue_name: string | null;
  };
  const next = (nextRes.data as NextRow | null) ?? null;
  const nextShow =
    next && next.show_date
      ? {
          city: (next.city ?? "TBD").toUpperCase(),
          venue: (next.venue_name ?? "TBD").toUpperCase(),
          date: next.show_date,
          time: next.set_time,
          label: (next.venue_name ?? next.city ?? "TBD").toUpperCase(),
        }
      : null;

  return {
    nextShow,
    onTheRoadDays: onRoadRes.count ?? 0,
    attentionCount:
      (offersRes.count ?? 0) +
      (holdingRes.count ?? 0) +
      (leadsRes.count ?? 0) +
      completed,
  };
});
