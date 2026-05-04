import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ReleaseAsset, ReleaseMarketing } from "@/lib/supabase/types";

export async function listAssets(releaseId: string): Promise<ReleaseAsset[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("release_assets")
    .select("*")
    .eq("release_id", releaseId)
    .order("created_at", { ascending: true });
  return (data ?? []) as ReleaseAsset[];
}

export async function listMarketing(
  releaseId: string,
): Promise<ReleaseMarketing[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("release_marketing")
    .select("*")
    .eq("release_id", releaseId)
    .order("scheduled_for", { ascending: true, nullsFirst: false });
  return (data ?? []) as ReleaseMarketing[];
}
