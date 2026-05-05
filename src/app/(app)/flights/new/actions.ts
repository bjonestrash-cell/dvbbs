"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const NewFlightSchema = z.object({
  show_id: z.string().uuid().optional().or(z.literal("")),
  passenger_name: z.string().min(1).max(120),
  airline: z.string().min(1).max(120),
  flight_number: z.string().max(20).optional().or(z.literal("")),
  confirmation_code: z.string().max(20).optional().or(z.literal("")),
  departure_airport: z.string().min(2).max(8),
  arrival_airport: z.string().min(2).max(8),
  departure_time: z.string().min(1),
  arrival_time: z.string().min(1),
  cabin: z.enum(["economy", "premium", "business", "first"]),
  seat: z.string().max(8).optional().or(z.literal("")),
  cost: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v && v.length > 0 ? Number(v) : null)),
  currency: z.string().max(8).optional().or(z.literal("")),
  status: z
    .enum(["booked", "confirmed", "checked_in", "completed", "cancelled"])
    .default("booked"),
  ticket_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type NewFlightState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createFlight(
  _prev: NewFlightState,
  formData: FormData,
): Promise<NewFlightState> {
  await requireRole("principal", "manager", "agent");
  const raw = Object.fromEntries(formData.entries());
  const parsed = NewFlightSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const v = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flights")
    .insert({
      show_id: v.show_id || null,
      passenger_name: v.passenger_name,
      airline: v.airline,
      flight_number: v.flight_number || null,
      confirmation_code: v.confirmation_code || null,
      departure_airport: v.departure_airport.toUpperCase(),
      arrival_airport: v.arrival_airport.toUpperCase(),
      departure_time: v.departure_time,
      arrival_time: v.arrival_time,
      cabin: v.cabin,
      seat: v.seat || null,
      cost: v.cost,
      currency: v.currency || "USD",
      status: v.status,
      ticket_url: v.ticket_url || null,
      notes: v.notes || null,
    })
    .select("id")
    .single();
  if (error || !data) {
    return {
      status: "error",
      message: error?.message ?? "Could not save flight.",
    };
  }
  revalidatePath("/flights");
  redirect(`/flights/${data.id}`);
}
