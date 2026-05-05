import type { MerchStatus, MerchSaleSource } from "@/lib/supabase/types";

export const MERCH_STATUS_LABEL: Record<MerchStatus, string> = {
  draft: "Draft",
  active: "Active",
  sold_out: "Sold out",
  archived: "Archived",
};

export const MERCH_STATUS_ORDER: MerchStatus[] = [
  "active",
  "draft",
  "sold_out",
  "archived",
];

export const MERCH_SALE_SOURCE_LABEL: Record<MerchSaleSource, string> = {
  shopify: "Shopify",
  tour: "Tour",
  wholesale: "Wholesale",
  other: "Other",
};
