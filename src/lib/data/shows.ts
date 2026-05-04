import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Show, ShowStatus } from "@/lib/supabase/types";

export type ShowFilters = {
  status?: ShowStatus[];
  from?: string;
  to?: string;
  q?: string;
  region?: string;
};

export async function listShows(filters: ShowFilters = {}): Promise<Show[]> {
  const supabase = await createClient();
  let q = supabase
    .from("shows")
    .select("*")
    .order("show_date", { ascending: true, nullsFirst: false });

  if (filters.status?.length) q = q.in("status", filters.status);
  if (filters.from) q = q.gte("show_date", filters.from);
  if (filters.to) q = q.lte("show_date", filters.to);
  if (filters.region) q = q.eq("region", filters.region);
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    q = q.or(`city.ilike.${term},venue_name.ilike.${term}`);
  }

  const { data } = await q;
  return (data ?? []) as Show[];
}

export async function getShow(id: string): Promise<Show | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shows")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as Show | null) ?? null;
}

export const STATUS_ORDER: ShowStatus[] = [
  "confirmed",
  "contracted",
  "holding",
  "offered",
  "lead",
  "completed",
  "cancelled",
];

export function groupByStatus(shows: Show[]): Map<ShowStatus, Show[]> {
  const groups = new Map<ShowStatus, Show[]>();
  for (const s of STATUS_ORDER) groups.set(s, []);
  for (const show of shows) {
    const arr = groups.get(show.status) ?? [];
    arr.push(show);
    groups.set(show.status, arr);
  }
  return groups;
}
