"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const TaskSchema = z.object({
  channel: z.enum([
    "instagram",
    "tiktok",
    "youtube",
    "twitter",
    "newsletter",
    "press",
    "radio",
    "dsp_pitch",
    "ads",
    "other",
  ]),
  task: z.string().min(1).max(400),
  status: z.enum(["todo", "in_progress", "done"]).default("todo"),
  scheduled_for: z.string().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

const StatusSchema = z.enum(["todo", "in_progress", "done"]);

export type MarketingState = {
  status: "idle" | "ok" | "error";
  message?: string;
};
export const initialMarketingState: MarketingState = { status: "idle" };

export async function addMarketing(
  releaseId: string,
  releaseSlug: string,
  _prev: MarketingState,
  formData: FormData,
): Promise<MarketingState> {
  await requireRole("principal", "manager");
  const parsed = TaskSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("release_marketing").insert({
    release_id: releaseId,
    channel: v.channel,
    task: v.task,
    status: v.status,
    scheduled_for: v.scheduled_for || null,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };
  revalidatePath(`/releases/${releaseSlug}/marketing`);
  return { status: "ok" };
}

export async function setMarketingStatus(
  taskId: string,
  releaseSlug: string,
  status: string,
) {
  await requireRole("principal", "manager");
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) return { ok: false as const, message: "Bad status." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("release_marketing")
    .update({ status: parsed.data })
    .eq("id", taskId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath(`/releases/${releaseSlug}/marketing`);
  return { ok: true as const };
}

export async function removeMarketing(taskId: string, releaseSlug: string) {
  await requireRole("principal", "manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("release_marketing")
    .delete()
    .eq("id", taskId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath(`/releases/${releaseSlug}/marketing`);
  return { ok: true as const };
}
