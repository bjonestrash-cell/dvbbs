import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Release, ReleaseStatus } from "@/lib/supabase/types";

export const RELEASE_STATUS_ORDER: ReleaseStatus[] = [
  "idea",
  "in_production",
  "mixing",
  "mastered",
  "delivered",
  "scheduled",
  "released",
  "archived",
];

export const RELEASE_STATUS_LABEL: Record<ReleaseStatus, string> = {
  idea: "Idea",
  in_production: "In production",
  mixing: "Mixing",
  mastered: "Mastered",
  delivered: "Delivered",
  scheduled: "Scheduled",
  released: "Released",
  archived: "Archived",
};

export async function listReleases(): Promise<Release[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .order("release_date", { ascending: false, nullsFirst: false });
  return (data ?? []) as Release[];
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return (data as Release | null) ?? null;
}

export function groupByReleaseStatus(
  releases: Release[],
): Map<ReleaseStatus, Release[]> {
  const groups = new Map<ReleaseStatus, Release[]>();
  for (const s of RELEASE_STATUS_ORDER) groups.set(s, []);
  for (const r of releases) {
    const arr = groups.get(r.status) ?? [];
    arr.push(r);
    groups.set(r.status, arr);
  }
  return groups;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
