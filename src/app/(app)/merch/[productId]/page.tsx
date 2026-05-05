import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { MerchIcon } from "../_components/merch-icon";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import {
  getProduct,
  listInventory,
  listSales,
  MERCH_STATUS_LABEL,
} from "@/lib/data/merch";
import { listShows, getShow } from "@/lib/data/shows";
import { formatDateLong, formatMoney } from "@/lib/format";
import { ProductStatusControl } from "./_components/product-status-control";
import { InventorySection } from "./_components/inventory-section";
import { SalesSection } from "./_components/sales-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) return { title: "Product. DVBBS HQ" };
  return { title: `${product.name}. DVBBS HQ` };
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);
  if (!product) notFound();

  const today = new Date().toISOString().slice(0, 10);
  const [inventory, sales, allShows, exclusiveShow] = await Promise.all([
    listInventory(product.id),
    listSales(product.id),
    listShows({ from: today }),
    product.exclusive_show_id ? getShow(product.exclusive_show_id) : null,
  ]);

  const margin =
    product.price && product.cost_per_unit
      ? Math.round(
          ((Number(product.price) - Number(product.cost_per_unit)) /
            Number(product.price)) *
            100,
        )
      : null;

  const exclusiveExpired =
    exclusiveShow?.show_date && exclusiveShow.show_date < today;

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title={titleCase(product.name)}
        description={product.category ? titleCase(product.category) : undefined}
        actions={
          <Link
            href="/merch"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            All products
          </Link>
        }
      />

      <div className="px-6 md:px-10 py-8 flex flex-col gap-6">
        <section className="flex flex-col md:flex-row gap-6 md:gap-8">
          <ProductImage
            url={product.image_url}
            title={product.name}
            category={product.category}
          />
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <ProductStatusControl
                productId={product.id}
                status={product.status}
              />
              {product.is_tour_exclusive ? (
                <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-accent">
                  Tour exclusive
                </span>
              ) : null}
              {exclusiveExpired ? (
                <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-holding">
                  Expired
                </span>
              ) : null}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 text-sm">
              <KV
                label="Retail"
                value={product.price ? formatMoney(product.price, "USD") : "—"}
                big
              />
              <KV
                label="Cost"
                value={
                  product.cost_per_unit
                    ? formatMoney(product.cost_per_unit, "USD")
                    : "—"
                }
              />
              <KV
                label="Margin"
                value={margin !== null ? `${margin}%` : "—"}
                tone={margin !== null && margin < 30 ? "warn" : undefined}
              />
              <KV label="SKU" value={product.sku ?? "—"} mono />
              <KV
                label="Category"
                value={product.category ? titleCase(product.category) : "—"}
              />
              {product.shopify_product_id ? (
                <KV
                  label="Shopify"
                  value={product.shopify_product_id}
                  mono
                />
              ) : null}
            </div>

            {exclusiveShow ? (
              <div className="border border-line bg-page/60 px-4 py-3">
                <div className="marker">Tied to</div>
                <p className="mt-1 font-sans text-[13px] text-fg">
                  {titleCase(exclusiveShow.city)} ·{" "}
                  {titleCase(exclusiveShow.venue_name)}
                  {exclusiveShow.show_date ? (
                    <span className="text-fg-dim">
                      {" — " + formatDateLong(exclusiveShow.show_date)}
                    </span>
                  ) : null}
                </p>
                {exclusiveExpired ? (
                  <p className="mt-1 font-sans text-[12px] text-fg-faint">
                    The show has passed. Set status to archived or extend.
                  </p>
                ) : null}
              </div>
            ) : null}

            {product.notes ? (
              <div>
                <div className="marker mb-1">Notes</div>
                <p className="font-sans text-[13px] text-fg-dim leading-[1.5] whitespace-pre-line">
                  {product.notes}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <InventorySection productId={product.id} inventory={inventory} />
        <SalesSection
          productId={product.id}
          sales={sales}
          inventory={inventory}
          shows={allShows}
        />
      </div>
    </>
  );
}

function ProductImage({
  url,
  title,
  category,
}: {
  url: string | null;
  title: string;
  category: string | null;
}) {
  if (!url) {
    return (
      <div className="w-full md:w-[280px] aspect-square shrink-0 grid place-items-center bg-surface-2 border border-line">
        <MerchIcon name={title} category={category} size={56} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} product image`}
      className="w-full md:w-[280px] aspect-square shrink-0 border border-line object-cover"
    />
  );
}

function KV({
  label,
  value,
  big,
  mono,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  big?: boolean;
  mono?: boolean;
  tone?: "warn";
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="label">{label}</span>
      <span
        className={
          "text-fg " +
          (big
            ? "display-stat tabular text-[28px]"
            : mono
              ? "font-mono text-[13px]"
              : "font-sans text-[14px]") +
          (tone === "warn" ? " text-holding" : "")
        }
        style={big ? { fontWeight: 500, letterSpacing: "-0.02em" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
