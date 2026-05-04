"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { createContact } from "@/lib/data/contacts";
import { logShowActivity } from "@/lib/data/activity";

const ShowSchema = z
  .object({
    show_date: z.string().min(1, { error: "Date is required." }),
    venue_name: z.string().min(1, { error: "Venue is required." }).max(200),
    city: z.string().min(1, { error: "City is required." }).max(100),
    country: z.string().max(100).optional().or(z.literal("")),
    region: z.string().max(100).optional().or(z.literal("")),
    timezone: z.string().max(60).optional().or(z.literal("")),
    status: z
      .enum(["lead", "offered", "holding", "confirmed", "contracted"])
      .default("lead"),
    capacity: z.coerce.number().int().nonnegative().optional().or(z.nan()),
    currency: z.string().length(3).default("USD"),
    fee_offered: z.coerce.number().nonnegative().optional().or(z.nan()),
    promoter_mode: z.enum(["none", "existing", "new"]).default("none"),
    promoter_contact_id: z.string().uuid().optional().or(z.literal("")),
    new_promoter_name: z.string().max(200).optional().or(z.literal("")),
    new_promoter_email: z.email().optional().or(z.literal("")),
    new_promoter_company: z.string().max(200).optional().or(z.literal("")),
    notes: z.string().max(4000).optional().or(z.literal("")),
  })
  .refine(
    (v) => v.promoter_mode !== "existing" || !!v.promoter_contact_id,
    { message: "Pick a promoter.", path: ["promoter_contact_id"] },
  )
  .refine(
    (v) => v.promoter_mode !== "new" || !!v.new_promoter_name,
    { message: "Promoter name is required.", path: ["new_promoter_name"] },
  );

export type CreateShowState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createShow(
  _prev: CreateShowState,
  formData: FormData,
): Promise<CreateShowState> {
  await requireRole("principal", "manager", "agent");

  const parsed = ShowSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  let promoter_contact_id: string | null = null;
  if (v.promoter_mode === "existing" && v.promoter_contact_id) {
    promoter_contact_id = v.promoter_contact_id;
  } else if (v.promoter_mode === "new" && v.new_promoter_name) {
    const c = await createContact({
      type: "promoter",
      name: v.new_promoter_name,
      email: v.new_promoter_email || null,
      company: v.new_promoter_company || null,
    });
    if (!c) {
      return { status: "error", message: "Could not save promoter." };
    }
    promoter_contact_id = c.id;
  }

  const supabase = await createClient();
  const insert = {
    status: v.status,
    show_date: v.show_date,
    venue_name: v.venue_name,
    city: v.city,
    country: v.country || null,
    region: v.region || null,
    timezone: v.timezone || null,
    capacity:
      typeof v.capacity === "number" && Number.isFinite(v.capacity)
        ? v.capacity
        : null,
    currency: v.currency,
    fee_offered:
      typeof v.fee_offered === "number" && Number.isFinite(v.fee_offered)
        ? v.fee_offered
        : null,
    promoter_contact_id,
    notes: v.notes || null,
  };

  const { data, error } = await supabase
    .from("shows")
    .insert(insert)
    .select("id")
    .single();

  if (error || !data) {
    return {
      status: "error",
      message: error?.message ?? "Could not create show.",
    };
  }

  const created = data as { id: string };
  await logShowActivity(created.id, "show.created", {
    snapshot: insert,
  });
  revalidatePath("/tour");
  redirect(`/tour/${created.id}`);
}
