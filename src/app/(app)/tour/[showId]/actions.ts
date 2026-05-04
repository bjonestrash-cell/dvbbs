"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { logShowActivity } from "@/lib/data/activity";
import type { ShowStatus } from "@/lib/supabase/types";

const NumberOrEmpty = z.union([
  z.literal(""),
  z.coerce.number().nonnegative(),
]);

const TimeOrEmpty = z.union([z.literal(""), z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/)]);

const FieldsSchema = z.object({
  status: z
    .enum([
      "lead",
      "offered",
      "holding",
      "confirmed",
      "contracted",
      "completed",
      "cancelled",
    ])
    .optional(),
  show_date: z.string().min(1).optional(),
  doors_time: TimeOrEmpty.optional(),
  set_time: TimeOrEmpty.optional(),
  set_length_minutes: NumberOrEmpty.optional(),
  timezone: z.string().max(60).optional(),
  venue_name: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  country: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  capacity: NumberOrEmpty.optional(),
  fee_offered: NumberOrEmpty.optional(),
  fee_confirmed: NumberOrEmpty.optional(),
  currency: z.string().length(3).optional(),
  deposit_received: NumberOrEmpty.optional(),
  travel_covered: z.union([z.literal("on"), z.literal("")]).optional(),
  hospitality_covered: z.union([z.literal("on"), z.literal("")]).optional(),
  notes: z.string().max(8000).optional(),
});

export type UpdateShowState = {
  status: "idle" | "ok" | "error";
  message?: string;
};

const empty: UpdateShowState = { status: "idle" };

export async function updateShow(
  showId: string,
  _prev: UpdateShowState,
  formData: FormData,
): Promise<UpdateShowState> {
  await requireRole("principal", "manager", "agent");

  const raw = Object.fromEntries(formData.entries());
  const parsed = FieldsSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: "Validation failed." };
  }
  const v = parsed.data;

  const update: Record<string, unknown> = {};
  function num(field: keyof typeof v) {
    const x = v[field];
    if (x === "" || x === undefined) return undefined;
    return typeof x === "number" ? x : null;
  }

  if (v.status !== undefined) update.status = v.status;
  if (v.show_date !== undefined) update.show_date = v.show_date;
  if (v.doors_time !== undefined) update.doors_time = v.doors_time || null;
  if (v.set_time !== undefined) update.set_time = v.set_time || null;
  if (v.set_length_minutes !== undefined)
    update.set_length_minutes = num("set_length_minutes") ?? null;
  if (v.timezone !== undefined) update.timezone = v.timezone || null;
  if (v.venue_name !== undefined) update.venue_name = v.venue_name;
  if (v.city !== undefined) update.city = v.city;
  if (v.country !== undefined) update.country = v.country || null;
  if (v.region !== undefined) update.region = v.region || null;
  if (v.capacity !== undefined) update.capacity = num("capacity") ?? null;
  if (v.fee_offered !== undefined) update.fee_offered = num("fee_offered") ?? null;
  if (v.fee_confirmed !== undefined)
    update.fee_confirmed = num("fee_confirmed") ?? null;
  if (v.currency !== undefined) update.currency = v.currency;
  if (v.deposit_received !== undefined)
    update.deposit_received = num("deposit_received") ?? null;
  if (v.travel_covered !== undefined)
    update.travel_covered = v.travel_covered === "on";
  if (v.hospitality_covered !== undefined)
    update.hospitality_covered = v.hospitality_covered === "on";
  if (v.notes !== undefined) update.notes = v.notes || null;

  if (Object.keys(update).length === 0) {
    return { status: "ok" };
  }

  const supabase = await createClient();
  const { data: prev } = await supabase
    .from("shows")
    .select("*")
    .eq("id", showId)
    .maybeSingle();
  const before = (prev as Record<string, unknown> | null) ?? null;

  const { error } = await supabase.from("shows").update(update).eq("id", showId);
  if (error) {
    return { status: "error", message: error.message };
  }

  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const k of Object.keys(update)) {
    const from = before?.[k] ?? null;
    const to = update[k] ?? null;
    if (JSON.stringify(from) !== JSON.stringify(to)) {
      changes[k] = { from, to };
    }
  }
  await logShowActivity(showId, "show.updated", { changes });

  revalidatePath(`/tour/${showId}`);
  revalidatePath("/tour");
  return { status: "ok" };
}

export async function setShowStatus(
  showId: string,
  status: ShowStatus,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager", "agent");
  const supabase = await createClient();
  const { error } = await supabase
    .from("shows")
    .update({ status })
    .eq("id", showId);
  if (error) return { ok: false, message: error.message };
  await logShowActivity(showId, "show.status_changed", { to: status });
  revalidatePath(`/tour/${showId}`);
  revalidatePath("/tour");
  return { ok: true };
}

export { empty as initialUpdateShowState };
