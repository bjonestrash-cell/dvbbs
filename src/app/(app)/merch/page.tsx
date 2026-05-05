import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import {
  inventoryHealth,
  listCategories,
  listProducts,
} from "@/lib/data/merch";
import { createClient } from "@/lib/supabase/server";
import type { MerchStatus } from "@/lib/supabase/types";
import { InventoryHealth } from "./_components/inventory-health";
import { MerchFilters } from "./_components/merch-filters";
import { ProductGrid } from "./_components/product-grid";

export const metadata = { title: "Merch. DVBBS HQ" };

const ALL_STATUSES: MerchStatus[] = ["draft", "active", "sold_out", "archived"];

export default async function MerchPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    tour?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const status = sp.status
    ? (sp.status.split(",").filter((s) =>
        (ALL_STATUSES as string[]).includes(s),
      ) as MerchStatus[])
    : undefined;

  const [products, health, categories, counts] = await Promise.all([
    listProducts({
      status: status?.length ? status : undefined,
      category: sp.category || undefined,
      tourExclusiveOnly: sp.tour === "1",
      q: sp.q || undefined,
    }),
    inventoryHealth(),
    listCategories(),
    loadStatusCounts(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="Merch"
        description="Products, stock, tour exclusives. Aggregated, not replicated from Shopify."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/merch/sales"
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              Sales
            </Link>
            <Link
              href="/merch/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              + New product
            </Link>
          </div>
        }
      />

      <div className="pt-6 md:pt-8">
        <InventoryHealth {...health} />
      </div>

      <MerchFilters categories={categories} counts={counts} />

      {products.length === 0 ? (
        <div className="px-6 md:px-10 py-10">
          <EmptyState
            title="Nothing to sell yet."
            hint="Add a product to start tracking inventory and tour-exclusive drops."
            action={
              <Link
                href="/merch/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                + New product
              </Link>
            }
          />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}

async function loadStatusCounts(): Promise<Partial<Record<MerchStatus, number>>> {
  const supabase = await createClient();
  const counts: Partial<Record<MerchStatus, number>> = {};
  await Promise.all(
    ALL_STATUSES.map(async (s) => {
      const { count } = await supabase
        .from("merch_products")
        .select("id", { count: "exact", head: true })
        .eq("status", s);
      counts[s] = count ?? 0;
    }),
  );
  return counts;
}
