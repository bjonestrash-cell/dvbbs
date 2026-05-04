import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ShowTravel,
  ShowLodging,
  ShowCrew,
  ShowSetlist,
  Contact,
} from "@/lib/supabase/types";

export async function listTravel(show_id: string): Promise<ShowTravel[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_travel")
    .select("*")
    .eq("show_id", show_id)
    .order("departure_time", { ascending: true, nullsFirst: false });
  return (data ?? []) as ShowTravel[];
}

export async function listLodging(show_id: string): Promise<ShowLodging[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_lodging")
    .select("*")
    .eq("show_id", show_id)
    .order("check_in", { ascending: true, nullsFirst: false });
  return (data ?? []) as ShowLodging[];
}

export async function listCrew(
  show_id: string,
): Promise<(ShowCrew & { contact?: Pick<Contact, "name" | "email"> | null })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_crew")
    .select("*, contact:contact_id (name, email)")
    .eq("show_id", show_id);
  return (data as (ShowCrew & { contact?: Contact | null })[] | null) ?? [];
}

export async function listSetlist(show_id: string): Promise<ShowSetlist[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_setlist")
    .select("*")
    .eq("show_id", show_id)
    .order("position", { ascending: true, nullsFirst: false });
  return (data ?? []) as ShowSetlist[];
}
