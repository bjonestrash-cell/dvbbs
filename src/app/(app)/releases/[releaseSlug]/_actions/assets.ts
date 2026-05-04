"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const AssetSchema = z.object({
  asset_type: z.enum([
    "master_wav",
    "instrumental",
    "stems",
    "radio_edit",
    "clean",
    "dirty",
    "cover_art",
    "press_shot",
    "music_video",
    "lyric_video",
    "press_release",
    "one_sheet",
    "splits_doc",
  ]),
  status: z
    .enum(["not_started", "in_progress", "review", "approved", "final"])
    .default("not_started"),
  due_date: z.string().optional().or(z.literal("")),
  file_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const StatusSchema = z.enum([
  "not_started",
  "in_progress",
  "review",
  "approved",
  "final",
]);

export type AssetState = { status: "idle" | "ok" | "error"; message?: string };
export const initialAssetState: AssetState = { status: "idle" };

export async function addAsset(
  releaseId: string,
  releaseSlug: string,
  _prev: AssetState,
  formData: FormData,
): Promise<AssetState> {
  await requireRole("principal", "manager");
  const parsed = AssetSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("release_assets").insert({
    release_id: releaseId,
    asset_type: v.asset_type,
    status: v.status,
    due_date: v.due_date || null,
    file_url: v.file_url || null,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };
  revalidatePath(`/releases/${releaseSlug}/assets`);
  return { status: "ok" };
}

export async function setAssetStatus(
  assetId: string,
  releaseSlug: string,
  status: string,
) {
  await requireRole("principal", "manager");
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, message: "Bad status." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("release_assets")
    .update({ status: parsed.data })
    .eq("id", assetId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath(`/releases/${releaseSlug}/assets`);
  return { ok: true as const };
}

export async function removeAsset(assetId: string, releaseSlug: string) {
  await requireRole("principal", "manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("release_assets")
    .delete()
    .eq("id", assetId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath(`/releases/${releaseSlug}/assets`);
  return { ok: true as const };
}
