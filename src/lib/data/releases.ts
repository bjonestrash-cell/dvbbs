import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Release, ReleaseStatus } from "@/lib/supabase/types";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "./release-shared";

export { RELEASE_STATUS_LABEL, RELEASE_STATUS_ORDER };

export async function listReleases(): Promise<Release[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("*")
    .order("release_date", { ascending: false, nullsFirst: false });
  return (data ?? []) as Release[];
}

export const getReleaseBySlug = cache(
  async (slug: string): Promise<Release | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("releases")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    return (data as Release | null) ?? null;
  },
);

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
