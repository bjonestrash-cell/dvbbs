import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Contact, ContactType, Show } from "@/lib/supabase/types";

export type ContactFilters = {
  type?: ContactType;
  q?: string;
};

export async function listContacts(
  typeOrFilters?: ContactType | ContactFilters,
): Promise<Contact[]> {
  const supabase = await createClient();
  const filters: ContactFilters =
    typeof typeOrFilters === "string"
      ? { type: typeOrFilters }
      : typeOrFilters ?? {};

  let q = supabase
    .from("contacts")
    .select("*")
    .order("name", { ascending: true });
  if (filters.type) q = q.eq("type", filters.type);
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    q = q.or(
      `name.ilike.${term},company.ilike.${term},email.ilike.${term},city.ilike.${term}`,
    );
  }
  const { data } = await q;
  return (data ?? []) as Contact[];
}

export const getContact = cache(
  async (id: string): Promise<Contact | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("contacts")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as Contact | null) ?? null;
  },
);

export async function listShowsForContact(contactId: string): Promise<Show[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("shows")
    .select("*")
    .or(
      `promoter_contact_id.eq.${contactId},agent_contact_id.eq.${contactId}`,
    )
    .order("show_date", { ascending: false, nullsFirst: false });
  return (data ?? []) as Show[];
}

export async function listContactCountsByType(): Promise<
  Partial<Record<ContactType, number>>
> {
  const supabase = await createClient();
  const types: ContactType[] = [
    "promoter",
    "venue",
    "agent",
    "label",
    "press",
    "collab",
    "crew",
    "other",
  ];
  const counts: Partial<Record<ContactType, number>> = {};
  await Promise.all(
    types.map(async (t) => {
      const { count } = await supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("type", t);
      counts[t] = count ?? 0;
    }),
  );
  return counts;
}

export async function createContact(input: {
  type: ContactType;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  notes?: string | null;
}): Promise<Contact | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("contacts")
    .insert(input)
    .select("*")
    .single();
  return (data as Contact | null) ?? null;
}
