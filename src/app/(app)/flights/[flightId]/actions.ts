"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const StatusSchema = z.enum([
  "booked",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
]);

export async function setFlightStatus(flightId: string, status: string) {
  await requireRole("principal", "manager", "agent");
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false as const, message: "Bad status." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("flights")
    .update({ status: parsed.data })
    .eq("id", flightId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/flights");
  revalidatePath(`/flights/${flightId}`);
  return { ok: true as const };
}

export async function deleteFlight(flightId: string) {
  await requireRole("principal", "manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("flights")
    .delete()
    .eq("id", flightId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/flights");
  redirect("/flights");
}
