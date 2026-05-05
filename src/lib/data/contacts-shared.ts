import type { ContactType } from "@/lib/supabase/types";

export const CONTACT_TYPE_LABEL: Record<ContactType, string> = {
  promoter: "Promoter",
  venue: "Venue",
  agent: "Agent",
  label: "Label",
  press: "Press",
  collab: "Collaborator",
  crew: "Crew",
  other: "Other",
};

export const CONTACT_TYPE_ORDER: ContactType[] = [
  "promoter",
  "agent",
  "venue",
  "label",
  "press",
  "collab",
  "crew",
  "other",
];
