"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createContact } from "@/lib/data/contacts";

const NewContactSchema = z.object({
  type: z.enum([
    "promoter",
    "venue",
    "agent",
    "label",
    "press",
    "collab",
    "crew",
    "other",
  ]),
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().max(60).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  country: z.string().max(60).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export type NewContactState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function newContact(
  _prev: NewContactState,
  formData: FormData,
): Promise<NewContactState> {
  await requireRole("principal", "manager", "agent");
  const parsed = NewContactSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;
  const c = await createContact({
    type: v.type,
    name: v.name,
    company: v.company || null,
    email: v.email || null,
    phone: v.phone || null,
    city: v.city || null,
    country: v.country || null,
    notes: v.notes || null,
  });
  if (!c) {
    return { status: "error", message: "Could not create contact." };
  }
  revalidatePath("/contacts");
  redirect(`/contacts/${c.id}`);
}
