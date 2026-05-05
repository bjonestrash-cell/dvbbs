import type { FlightCabin, FlightStatus } from "@/lib/supabase/types";

export const FLIGHT_CABIN_LABEL: Record<FlightCabin, string> = {
  economy: "Economy",
  premium: "Premium economy",
  business: "Business",
  first: "First",
};

export const FLIGHT_CABIN_ORDER: FlightCabin[] = [
  "economy",
  "premium",
  "business",
  "first",
];

export const FLIGHT_STATUS_LABEL: Record<FlightStatus, string> = {
  booked: "Booked",
  confirmed: "Confirmed",
  checked_in: "Checked in",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const FLIGHT_STATUS_ORDER: FlightStatus[] = [
  "booked",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
];

/** A small directory of common touring airports for quick keying.
 *  Not exhaustive; the form always allows a free-form IATA code. */
export const COMMON_AIRPORTS: Array<{ iata: string; label: string }> = [
  { iata: "LAX", label: "Los Angeles" },
  { iata: "JFK", label: "New York JFK" },
  { iata: "LGA", label: "New York LaGuardia" },
  { iata: "EWR", label: "Newark" },
  { iata: "MIA", label: "Miami" },
  { iata: "ORD", label: "Chicago O'Hare" },
  { iata: "LAS", label: "Las Vegas" },
  { iata: "SFO", label: "San Francisco" },
  { iata: "DCA", label: "Washington DCA" },
  { iata: "IAD", label: "Washington Dulles" },
  { iata: "ATL", label: "Atlanta" },
  { iata: "SEA", label: "Seattle" },
  { iata: "BOS", label: "Boston" },
  { iata: "DEN", label: "Denver" },
  { iata: "DFW", label: "Dallas Fort Worth" },
  { iata: "YYZ", label: "Toronto" },
  { iata: "YUL", label: "Montreal" },
  { iata: "YVR", label: "Vancouver" },
  { iata: "MEX", label: "Mexico City" },
  { iata: "LHR", label: "London Heathrow" },
  { iata: "LGW", label: "London Gatwick" },
  { iata: "CDG", label: "Paris" },
  { iata: "AMS", label: "Amsterdam" },
  { iata: "FRA", label: "Frankfurt" },
  { iata: "MUC", label: "Munich" },
  { iata: "BER", label: "Berlin" },
  { iata: "BCN", label: "Barcelona" },
  { iata: "MAD", label: "Madrid" },
  { iata: "IBZ", label: "Ibiza" },
  { iata: "FCO", label: "Rome" },
  { iata: "MXP", label: "Milan" },
  { iata: "VIE", label: "Vienna" },
  { iata: "ZRH", label: "Zurich" },
  { iata: "CPH", label: "Copenhagen" },
  { iata: "ARN", label: "Stockholm" },
  { iata: "OSL", label: "Oslo" },
  { iata: "BRU", label: "Brussels" },
  { iata: "DUB", label: "Dublin" },
  { iata: "LIS", label: "Lisbon" },
  { iata: "DXB", label: "Dubai" },
  { iata: "DOH", label: "Doha" },
  { iata: "SIN", label: "Singapore" },
  { iata: "HKG", label: "Hong Kong" },
  { iata: "NRT", label: "Tokyo Narita" },
  { iata: "HND", label: "Tokyo Haneda" },
  { iata: "ICN", label: "Seoul Incheon" },
  { iata: "BKK", label: "Bangkok" },
  { iata: "DPS", label: "Bali Denpasar" },
  { iata: "SYD", label: "Sydney" },
  { iata: "MEL", label: "Melbourne" },
  { iata: "GRU", label: "Sao Paulo" },
  { iata: "EZE", label: "Buenos Aires" },
];
