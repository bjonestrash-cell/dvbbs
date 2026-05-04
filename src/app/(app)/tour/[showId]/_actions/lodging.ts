"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { logShowActivity } from "@/lib/data/activity";

const LodgingSchema = z.object({
  hotel_name: z.string().min(1).max(200),
  address: z.string().max(400).optional().or(z.literal("")),
  check_in: z.string().optional().or(z.literal("")),
  check_out: z.string().optional().or(z.literal("")),
  confirmation_code: z.string().max(120).optional().or(z.literal("")),
  cost: z.coerce.number().nonnegative().optional().or(z.nan()),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type LodgingState = { status: "idle" | "ok" | "error"; message?: string };
export const initialLodgingState: LodgingState = { status: "idle" };

export async function addLodging(
  showId: string,
  _prev: LodgingState,
  formData: FormData,
): Promise<LodgingState> {
  await requireRole("principal", "manager", "agent");
  const parsed = LodgingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const cost =
    typeof v.cost === "number" && Number.isFinite(v.cost) ? v.cost : null;

  const supabase = await createClient();
  const { error } = await supabase.from("show_lodging").insert({
    show_id: showId,
    hotel_name: v.hotel_name,
    address: v.address || null,
    check_in: v.check_in || null,
    check_out: v.check_out || null,
    confirmation_code: v.confirmation_code || null,
    cost,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };

  await logShowActivity(showId, "lodging.added", { hotel_name: v.hotel_name });
  revalidatePath(`/tour/${showId}`);
  return { status: "ok" };
}

export async function removeLodging(showId: string, lodgingId: string) {
  await requireRole("principal", "manager", "agent");
  const supabase = await createClient();
  const { error } = await supabase
    .from("show_lodging")
    .delete()
    .eq("id", lodgingId);
  if (error) return { ok: false as const, message: error.message };
  await logShowActivity(showId, "lodging.removed", { id: lodgingId });
  revalidatePath(`/tour/${showId}`);
  return { ok: true as const };
}
