"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { logShowActivity } from "@/lib/data/activity";

const TrackSchema = z.object({
  track_title: z.string().min(1).max(200),
  artist: z.string().max(200).optional().or(z.literal("")),
  is_unreleased: z.union([z.literal("on"), z.literal("")]).optional(),
  spotify_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type SetlistState = { status: "idle" | "ok" | "error"; message?: string };
export const initialSetlistState: SetlistState = { status: "idle" };

export async function addTrack(
  showId: string,
  _prev: SetlistState,
  formData: FormData,
): Promise<SetlistState> {
  await requireRole("principal", "manager", "agent");
  const parsed = TrackSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;

  const supabase = await createClient();
  const countRes = await supabase
    .from("show_setlist")
    .select("id", { count: "exact", head: true })
    .eq("show_id", showId);
  const next = (countRes.count ?? 0) + 1;

  const { error } = await supabase.from("show_setlist").insert({
    show_id: showId,
    position: next,
    track_title: v.track_title,
    artist: v.artist || null,
    is_unreleased: v.is_unreleased === "on",
    spotify_url: v.spotify_url || null,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };

  await logShowActivity(showId, "setlist.updated", {
    added: v.track_title,
    position: next,
  });
  revalidatePath(`/tour/${showId}`);
  return { status: "ok" };
}

export async function removeTrack(showId: string, trackId: string) {
  await requireRole("principal", "manager", "agent");
  const supabase = await createClient();
  const { error } = await supabase
    .from("show_setlist")
    .delete()
    .eq("id", trackId);
  if (error) return { ok: false as const, message: error.message };
  await logShowActivity(showId, "setlist.updated", { removed: trackId });
  revalidatePath(`/tour/${showId}`);
  return { ok: true as const };
}
