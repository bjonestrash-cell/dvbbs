import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Flight, Show } from "@/lib/supabase/types";

export type FlightWithShow = Flight & {
  show?: Pick<Show, "id" | "city" | "venue_name" | "show_date" | "country"> | null;
};

/** All flights, future first, then most recent past. */
export async function listFlights(): Promise<FlightWithShow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flights")
    .select("*, show:shows(id, city, venue_name, show_date, country)")
    .order("departure_time", { ascending: true });
  return (data ?? []) as FlightWithShow[];
}

export const getFlight = cache(
  async (id: string): Promise<FlightWithShow | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("flights")
      .select("*, show:shows(id, city, venue_name, show_date, country)")
      .eq("id", id)
      .maybeSingle();
    return (data as FlightWithShow | null) ?? null;
  },
);

/** Flights for a single show, used on the show detail page. */
export async function listFlightsForShow(showId: string): Promise<Flight[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("flights")
    .select("*")
    .eq("show_id", showId)
    .order("departure_time", { ascending: true });
  return (data ?? []) as Flight[];
}

/** Quick stats for the dashboard header. */
export async function getFlightStats(): Promise<{
  total: number;
  upcoming: number;
  next: FlightWithShow | null;
}> {
  const all = await listFlights();
  const now = new Date().toISOString();
  const upcoming = all.filter(
    (f) => f.departure_time >= now && f.status !== "cancelled",
  );
  return {
    total: all.length,
    upcoming: upcoming.length,
    next: upcoming[0] ?? null,
  };
}
