"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { logShowActivity } from "@/lib/data/activity";

const TravelSchema = z.object({
  leg_type: z.enum(["flight", "train", "car", "ferry", "other"]),
  carrier: z.string().max(120).optional().or(z.literal("")),
  confirmation_code: z.string().max(120).optional().or(z.literal("")),
  departure_location: z.string().max(200).optional().or(z.literal("")),
  arrival_location: z.string().max(200).optional().or(z.literal("")),
  departure_time: z.string().optional().or(z.literal("")),
  arrival_time: z.string().optional().or(z.literal("")),
  cost: z.coerce.number().nonnegative().optional().or(z.literal("")).or(z.nan()),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type TravelState = { status: "idle" | "ok" | "error"; message?: string };
export const initialTravelState: TravelState = { status: "idle" };

export async function addTravel(
  showId: string,
  _prev: TravelState,
  formData: FormData,
): Promise<TravelState> {
  await requireRole("principal", "manager", "agent");
  const parsed = TravelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const cost =
    typeof v.cost === "number" && Number.isFinite(v.cost) ? v.cost : null;

  const supabase = await createClient();
  const { error } = await supabase.from("show_travel").insert({
    show_id: showId,
    leg_type: v.leg_type,
    carrier: v.carrier || null,
    confirmation_code: v.confirmation_code || null,
    departure_location: v.departure_location || null,
    arrival_location: v.arrival_location || null,
    departure_time: v.departure_time || null,
    arrival_time: v.arrival_time || null,
    cost,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };

  await logShowActivity(showId, "travel.added", {
    leg_type: v.leg_type,
    departure_location: v.departure_location,
    arrival_location: v.arrival_location,
  });
  revalidatePath(`/tour/${showId}`);
  return { status: "ok" };
}

export async function removeTravel(showId: string, travelId: string) {
  await requireRole("principal", "manager", "agent");
  const supabase = await createClient();
  const { error } = await supabase.from("show_travel").delete().eq("id", travelId);
  if (error) return { ok: false as const, message: error.message };
  await logShowActivity(showId, "travel.removed", { id: travelId });
  revalidatePath(`/tour/${showId}`);
  return { ok: true as const };
}
