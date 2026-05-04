import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { SmartLink, SmartLinkClick } from "@/lib/supabase/types";

export type Platform =
  | "spotify"
  | "apple"
  | "soundcloud"
  | "youtube"
  | "beatport";

export const PLATFORM_LABEL: Record<Platform, string> = {
  spotify: "Spotify",
  apple: "Apple Music",
  soundcloud: "SoundCloud",
  youtube: "YouTube",
  beatport: "Beatport",
};

export const PLATFORM_ORDER: Platform[] = [
  "spotify",
  "apple",
  "soundcloud",
  "youtube",
  "beatport",
];

export async function listSmartLinks(): Promise<
  (SmartLink & { release_title?: string | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("smart_links")
    .select("*, release:release_id(title)")
    .order("created_at", { ascending: false });
  type Row = SmartLink & { release?: { title: string | null } | null };
  return ((data as Row[] | null) ?? []).map((r) => ({
    ...r,
    release_title: r.release?.title ?? null,
  }));
}

export const getSmartLink = cache(
  async (slug: string): Promise<SmartLink | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("smart_links")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as SmartLink | null) ?? null;
  },
);

export async function getSmartLinkById(id: string): Promise<SmartLink | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("smart_links")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return (data as SmartLink | null) ?? null;
}

export async function listClicks(
  smartLinkId: string,
  limit = 50,
): Promise<SmartLinkClick[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("smart_link_clicks")
    .select("*")
    .eq("smart_link_id", smartLinkId)
    .order("clicked_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as SmartLinkClick[];
}

export async function clicksByPlatform(
  smartLinkId: string,
): Promise<{ platform: string; count: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("smart_link_clicks")
    .select("platform")
    .eq("smart_link_id", smartLinkId);
  type Row = { platform: string | null };
  const rows = (data as Row[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = r.platform ?? "unknown";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([platform, count]) => ({ platform, count }))
    .sort((a, b) => b.count - a.count);
}

export async function clicksByCountry(
  smartLinkId: string,
  limit = 5,
): Promise<{ country: string; count: number }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("smart_link_clicks")
    .select("country")
    .eq("smart_link_id", smartLinkId);
  type Row = { country: string | null };
  const rows = (data as Row[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const r of rows) {
    const k = r.country ?? "Unknown";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
