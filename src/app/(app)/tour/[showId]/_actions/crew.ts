"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { createContact } from "@/lib/data/contacts";
import { logShowActivity } from "@/lib/data/activity";

const CrewSchema = z
  .object({
    mode: z.enum(["existing", "new"]),
    contact_id: z.string().uuid().optional().or(z.literal("")),
    new_name: z.string().max(200).optional().or(z.literal("")),
    new_email: z.email().optional().or(z.literal("")),
    role: z.string().max(120).optional().or(z.literal("")),
    fee: z.coerce.number().nonnegative().optional().or(z.nan()),
    travel_covered: z.union([z.literal("on"), z.literal("")]).optional(),
  })
  .refine((v) => v.mode !== "existing" || !!v.contact_id, {
    message: "Pick a contact.",
    path: ["contact_id"],
  })
  .refine((v) => v.mode !== "new" || !!v.new_name, {
    message: "Name required.",
    path: ["new_name"],
  });

export type CrewState = { status: "idle" | "ok" | "error"; message?: string };
export const initialCrewState: CrewState = { status: "idle" };

export async function addCrew(
  showId: string,
  _prev: CrewState,
  formData: FormData,
): Promise<CrewState> {
  await requireRole("principal", "manager", "agent");
  const parsed = CrewSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;

  let contact_id = v.contact_id || null;
  if (v.mode === "new" && v.new_name) {
    const c = await createContact({
      type: "crew",
      name: v.new_name,
      email: v.new_email || null,
    });
    if (!c) return { status: "error", message: "Could not save contact." };
    contact_id = c.id;
  }

  const supabase = await createClient();
  const fee =
    typeof v.fee === "number" && Number.isFinite(v.fee) ? v.fee : null;
  const { error } = await supabase.from("show_crew").insert({
    show_id: showId,
    contact_id,
    role: v.role || null,
    fee,
    travel_covered: v.travel_covered === "on",
  });
  if (error) return { status: "error", message: error.message };

  await logShowActivity(showId, "crew.added", {
    contact_id,
    role: v.role,
  });
  revalidatePath(`/tour/${showId}`);
  return { status: "ok" };
}

export async function removeCrew(showId: string, crewId: string) {
  await requireRole("principal", "manager", "agent");
  const supabase = await createClient();
  const { error } = await supabase.from("show_crew").delete().eq("id", crewId);
  if (error) return { ok: false as const, message: error.message };
  await logShowActivity(showId, "crew.removed", { id: crewId });
  revalidatePath(`/tour/${showId}`);
  return { ok: true as const };
}
