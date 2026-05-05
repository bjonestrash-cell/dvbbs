import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Flight, Show } from "@/lib/supabase/types";

export type FlightShowSnippet = Pick<
  Show,
  "id" | "city" | "venue_name" | "show_date" | "country"
>;

export type FlightWithShow = Flight & {
  show?: FlightShowSnippet | null;
};

export type FlightsResult = {
  flights: FlightWithShow[];
  /** Diagnostic: empty + ok if the table is reachable but unseeded.
   *  Populated with a message if the query failed (table missing, RLS,
   *  PostgREST cache stale, etc.). */
  error: string | null;
};

/**
 * Pull flights and their attached shows in two queries, then join in JS.
 *
 * Why not the nested PostgREST `show:shows(...)` syntax? Because it depends
 * on Supabase's schema cache having registered the foreign key from
 * flights.show_id to shows.id. After applying a fresh schema, that cache
 * can lag by a few minutes and the join silently returns an empty payload
 * — which is exactly what showed up as "flights still aren't showing"
 * even after the SQL was applied. Two-query join sidesteps the cache
 * entirely.
 */
async function listFlightsRaw(): Promise<FlightsResult> {
  const supabase = await createClient();

  const { data: flights, error: flightsError } = await supabase
    .from("flights")
    .select("*")
    .order("departure_time", { ascending: true });

  if (flightsError) {
    console.error("[flights] list query failed:", flightsError);
    return { flights: [], error: flightsError.message };
  }

  const rows = (flights ?? []) as Flight[];
  if (rows.length === 0) return { flights: [], error: null };

  const showIds = Array.from(
    new Set(rows.map((f) => f.show_id).filter((id): id is string => Boolean(id))),
  );

  let showById = new Map<string, FlightShowSnippet>();
  if (showIds.length > 0) {
    const { data: shows, error: showsError } = await supabase
      .from("shows")
      .select("id, city, venue_name, show_date, country")
      .in("id", showIds);
    if (showsError) {
      console.error("[flights] shows lookup failed:", showsError);
    } else if (shows) {
      showById = new Map(
        (shows as FlightShowSnippet[]).map((s) => [s.id, s]),
      );
    }
  }

  const merged: FlightWithShow[] = rows.map((f) => ({
    ...f,
    show: f.show_id ? showById.get(f.show_id) ?? null : null,
  }));

  return { flights: merged, error: null };
}

/** Convenience for callers that don't want to handle the diagnostic. */
export async function listFlights(): Promise<FlightWithShow[]> {
  const result = await listFlightsRaw();
  return result.flights;
}

/** Same as listFlights but exposes the diagnostic so the page can render
 *  a helpful message when the table is missing or empty. */
export async function listFlightsWithDiagnostic(): Promise<FlightsResult> {
  return listFlightsRaw();
}

export const getFlight = cache(
  async (id: string): Promise<FlightWithShow | null> => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[flights] get failed:", error);
      return null;
    }
    if (!data) return null;
    const flight = data as Flight;
    if (!flight.show_id) return { ...flight, show: null };

    const { data: show } = await supabase
      .from("shows")
      .select("id, city, venue_name, show_date, country")
      .eq("id", flight.show_id)
      .maybeSingle();

    return {
      ...flight,
      show: (show as FlightShowSnippet | null) ?? null,
    };
  },
);

/** Flights for a single show, used on the show detail page. */
export async function listFlightsForShow(showId: string): Promise<Flight[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("flights")
    .select("*")
    .eq("show_id", showId)
    .order("departure_time", { ascending: true });
  if (error) {
    console.error("[flights] listFlightsForShow failed:", error);
    return [];
  }
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
