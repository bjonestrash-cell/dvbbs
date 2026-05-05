import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  MerchInventory,
  MerchProduct,
  MerchSale,
  MerchStatus,
} from "@/lib/supabase/types";

// Constants live in @/lib/data/merch-shared so client components can import
// them without crossing the server-only boundary.
export {
  MERCH_STATUS_LABEL,
  MERCH_STATUS_ORDER,
  MERCH_SALE_SOURCE_LABEL,
} from "./merch-shared";

export type MerchProductWithInventory = MerchProduct & {
  total_units: number;
  variants: number;
  low_stock: boolean;
};

export type MerchFilters = {
  status?: MerchStatus[];
  category?: string;
  tourExclusiveOnly?: boolean;
  q?: string;
};

export async function listProducts(
  filters: MerchFilters = {},
): Promise<MerchProductWithInventory[]> {
  const supabase = await createClient();
  let q = supabase
    .from("merch_products")
    .select("*, merch_inventory(units_on_hand, reorder_threshold)")
    .order("created_at", { ascending: false });

  if (filters.status?.length) q = q.in("status", filters.status);
  if (filters.category) q = q.eq("category", filters.category);
  if (filters.tourExclusiveOnly) q = q.eq("is_tour_exclusive", true);
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, "\\$&")}%`;
    q = q.or(`name.ilike.${term},sku.ilike.${term},category.ilike.${term}`);
  }

  const { data } = await q;
  type Row = MerchProduct & {
    merch_inventory?:
      | { units_on_hand: number; reorder_threshold: number | null }[]
      | null;
  };
  const rows = (data as Row[] | null) ?? [];
  return rows.map((r) => {
    const inv = r.merch_inventory ?? [];
    const total = inv.reduce((sum, i) => sum + (i.units_on_hand ?? 0), 0);
    const lowStock = inv.some(
      (i) =>
        typeof i.reorder_threshold === "number" &&
        i.units_on_hand <= i.reorder_threshold,
    );
    return {
      id: r.id,
      name: r.name,
      sku: r.sku,
      category: r.category,
      price: r.price,
      cost_per_unit: r.cost_per_unit,
      shopify_product_id: r.shopify_product_id,
      image_url: r.image_url,
      status: r.status,
      is_tour_exclusive: r.is_tour_exclusive,
      exclusive_show_id: r.exclusive_show_id,
      notes: r.notes,
      created_at: r.created_at,
      updated_at: r.updated_at,
      total_units: total,
      variants: inv.length,
      low_stock: lowStock,
    };
  });
}

export const getProduct = cache(
  async (id: string): Promise<MerchProduct | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("merch_products")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    return (data as MerchProduct | null) ?? null;
  },
);

export async function listInventory(
  productId: string,
): Promise<MerchInventory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_inventory")
    .select("*")
    .eq("product_id", productId)
    .order("variant", { ascending: true, nullsFirst: false });
  return (data ?? []) as MerchInventory[];
}

export async function listSales(productId: string): Promise<MerchSale[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_sales")
    .select("*")
    .eq("product_id", productId)
    .order("sale_date", { ascending: false });
  return (data ?? []) as MerchSale[];
}

export async function listAllSales(): Promise<
  (MerchSale & { product_name?: string | null; show_label?: string | null })[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_sales")
    .select(
      "*, product:product_id(name), show:show_id(city, venue_name, show_date)",
    )
    .order("sale_date", { ascending: false });
  type Row = MerchSale & {
    product?: { name: string | null } | null;
    show?: {
      city: string | null;
      venue_name: string | null;
      show_date: string | null;
    } | null;
  };
  const rows = (data as Row[] | null) ?? [];
  return rows.map((r) => ({
    ...r,
    product_name: r.product?.name ?? null,
    show_label: r.show
      ? `${r.show.city ?? "TBD"}, ${r.show.venue_name ?? ""}`.trim()
      : null,
  }));
}

export async function listCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("merch_products")
    .select("category")
    .not("category", "is", null);
  const set = new Set<string>();
  for (const r of (data as { category: string }[] | null) ?? []) {
    if (r.category) set.add(r.category);
  }
  return Array.from(set).sort();
}

export async function inventoryHealth(): Promise<{
  total: number;
  active: number;
  lowStock: number;
  soldOut: number;
}> {
  const supabase = await createClient();
  const [{ count: total }, { count: active }, { count: soldOut }] =
    await Promise.all([
      supabase
        .from("merch_products")
        .select("id", { count: "exact", head: true }),
      supabase
        .from("merch_products")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("merch_products")
        .select("id", { count: "exact", head: true })
        .eq("status", "sold_out"),
    ]);

  const { data: invRows } = await supabase
    .from("merch_inventory")
    .select("units_on_hand, reorder_threshold");
  const lowStock =
    ((invRows as
      | { units_on_hand: number; reorder_threshold: number | null }[]
      | null) ?? []).filter(
      (r) =>
        typeof r.reorder_threshold === "number" &&
        r.units_on_hand <= r.reorder_threshold,
    ).length;

  return {
    total: total ?? 0,
    active: active ?? 0,
    lowStock,
    soldOut: soldOut ?? 0,
  };
}
