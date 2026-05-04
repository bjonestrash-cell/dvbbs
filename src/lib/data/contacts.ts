import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Contact, ContactType } from "@/lib/supabase/types";

export async function listContacts(type?: ContactType): Promise<Contact[]> {
  const supabase = await createClient();
  let q = supabase.from("contacts").select("*").order("name", { ascending: true });
  if (type) q = q.eq("type", type);
  const { data } = await q;
  return (data ?? []) as Contact[];
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
