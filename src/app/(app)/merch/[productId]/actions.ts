"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const ProductFieldsSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  sku: z.string().max(80).optional().or(z.literal("")),
  category: z.string().max(80).optional().or(z.literal("")),
  price: z.coerce.number().nonnegative().optional().or(z.nan()),
  cost_per_unit: z.coerce.number().nonnegative().optional().or(z.nan()),
  status: z
    .enum(["draft", "active", "sold_out", "archived"])
    .optional(),
  is_tour_exclusive: z
    .union([z.literal("on"), z.literal("")])
    .optional(),
  exclusive_show_id: z.string().uuid().optional().or(z.literal("")),
  image_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type ProductState = { status: "idle" | "ok" | "error"; message?: string };
export const initialProductState: ProductState = { status: "idle" };

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return null;
}

export async function updateProduct(
  productId: string,
  _prev: ProductState,
  formData: FormData,
): Promise<ProductState> {
  await requireRole("principal", "manager");
  const parsed = ProductFieldsSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "error", message: "Validation failed." };
  }
  const v = parsed.data;
  const update: Record<string, unknown> = {};
  if (v.name !== undefined) update.name = v.name;
  if (v.sku !== undefined) update.sku = v.sku || null;
  if (v.category !== undefined) update.category = v.category || null;
  if (v.price !== undefined) update.price = num(v.price);
  if (v.cost_per_unit !== undefined) update.cost_per_unit = num(v.cost_per_unit);
  if (v.status !== undefined) update.status = v.status;
  if (v.is_tour_exclusive !== undefined)
    update.is_tour_exclusive = v.is_tour_exclusive === "on";
  if (v.exclusive_show_id !== undefined)
    update.exclusive_show_id = v.exclusive_show_id || null;
  if (v.image_url !== undefined) update.image_url = v.image_url || null;
  if (v.notes !== undefined) update.notes = v.notes || null;

  if (Object.keys(update).length === 0) return { status: "ok" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_products")
    .update(update)
    .eq("id", productId);
  if (error) return { status: "error", message: error.message };

  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { status: "ok" };
}

export async function setProductStatus(
  productId: string,
  status: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager");
  const Schema = z.enum(["draft", "active", "sold_out", "archived"]);
  const parsed = Schema.safeParse(status);
  if (!parsed.success) return { ok: false, message: "Bad status." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_products")
    .update({ status: parsed.data })
    .eq("id", productId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { ok: true };
}

export async function deleteProduct(productId: string) {
  await requireRole("principal");
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_products")
    .delete()
    .eq("id", productId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/merch");
  redirect("/merch");
}

const InventorySchema = z.object({
  variant: z.string().max(80).optional().or(z.literal("")),
  units_on_hand: z.coerce.number().int().nonnegative().default(0),
  reorder_threshold: z.coerce.number().int().nonnegative().optional().or(z.nan()),
  vendor_contact_id: z.string().uuid().optional().or(z.literal("")),
  warehouse_location: z.string().max(200).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type InventoryState = ProductState;
export const initialInventoryState: InventoryState = { status: "idle" };

export async function addInventory(
  productId: string,
  _prev: InventoryState,
  formData: FormData,
): Promise<InventoryState> {
  await requireRole("principal", "manager");
  const parsed = InventorySchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const supabase = await createClient();
  const threshold = num(v.reorder_threshold);
  const { error } = await supabase.from("merch_inventory").insert({
    product_id: productId,
    variant: v.variant || null,
    units_on_hand: v.units_on_hand,
    reorder_threshold: threshold,
    vendor_contact_id: v.vendor_contact_id || null,
    warehouse_location: v.warehouse_location || null,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { status: "ok" };
}

export async function updateInventory(
  productId: string,
  inventoryId: string,
  formData: FormData,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager");
  const parsed = InventorySchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { ok: false, message: "Validation failed." };
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_inventory")
    .update({
      variant: v.variant || null,
      units_on_hand: v.units_on_hand,
      reorder_threshold: num(v.reorder_threshold),
      vendor_contact_id: v.vendor_contact_id || null,
      warehouse_location: v.warehouse_location || null,
      notes: v.notes || null,
    })
    .eq("id", inventoryId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { ok: true };
}

export async function setInventoryUnits(
  productId: string,
  inventoryId: string,
  units: number,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager");
  if (!Number.isFinite(units) || units < 0) {
    return { ok: false, message: "Bad units." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_inventory")
    .update({ units_on_hand: Math.floor(units) })
    .eq("id", inventoryId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { ok: true };
}

export async function removeInventory(
  productId: string,
  inventoryId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_inventory")
    .delete()
    .eq("id", inventoryId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch");
  return { ok: true };
}

const SaleSchema = z.object({
  variant: z.string().max(80).optional().or(z.literal("")),
  show_id: z.string().uuid().optional().or(z.literal("")),
  units_sold: z.coerce.number().int().positive(),
  gross: z.coerce.number().nonnegative(),
  source: z.enum(["shopify", "tour", "wholesale", "other"]).default("tour"),
  sale_date: z.string().min(1),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export type SaleState = ProductState;
export const initialSaleState: SaleState = { status: "idle" };

export async function recordSale(
  productId: string,
  _prev: SaleState,
  formData: FormData,
): Promise<SaleState> {
  await requireRole("principal", "manager", "accountant");
  const parsed = SaleSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) return { status: "error", message: "Validation failed." };
  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("merch_sales").insert({
    product_id: productId,
    variant: v.variant || null,
    show_id: v.show_id || null,
    units_sold: v.units_sold,
    gross: v.gross,
    source: v.source,
    sale_date: v.sale_date,
    notes: v.notes || null,
  });
  if (error) return { status: "error", message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch/sales");
  return { status: "ok" };
}

export async function removeSale(
  productId: string,
  saleId: string,
): Promise<{ ok: boolean; message?: string }> {
  await requireRole("principal", "manager", "accountant");
  const supabase = await createClient();
  const { error } = await supabase
    .from("merch_sales")
    .delete()
    .eq("id", saleId);
  if (error) return { ok: false, message: error.message };
  revalidatePath(`/merch/${productId}`);
  revalidatePath("/merch/sales");
  return { ok: true };
}
