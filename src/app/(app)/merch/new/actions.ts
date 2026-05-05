"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const NewProductSchema = z.object({
  name: z.string().min(1).max(200),
  sku: z.string().max(80).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().or(z.nan()),
  cost_per_unit: z.coerce.number().nonnegative().optional().or(z.nan()),
  status: z
    .enum(["draft", "active", "sold_out", "archived"])
    .default("draft"),
  is_tour_exclusive: z
    .union([z.literal("on"), z.literal("")])
    .optional(),
  exclusive_show_id: z.string().uuid().optional().or(z.literal("")),
  image_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type NewProductState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createProduct(
  _prev: NewProductState,
  formData: FormData,
): Promise<NewProductState> {
  await requireRole("principal", "manager");
  const parsed = NewProductSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const num = (x: unknown) =>
    typeof x === "number" && Number.isFinite(x) ? x : null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("merch_products")
    .insert({
      name: v.name,
      sku: v.sku || null,
      category: v.category || null,
      price: num(v.price),
      cost_per_unit: num(v.cost_per_unit),
      status: v.status,
      is_tour_exclusive: v.is_tour_exclusive === "on",
      exclusive_show_id: v.exclusive_show_id || null,
      image_url: v.image_url || null,
      notes: v.notes || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return {
      status: "error",
      message: error?.message ?? "Could not create product.",
    };
  }
  revalidatePath("/merch");
  redirect(`/merch/${(data as { id: string }).id}`);
}
