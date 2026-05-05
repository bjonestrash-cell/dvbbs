import Link from "next/link";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import { MERCH_STATUS_LABEL } from "@/lib/data/merch-shared";
import type { MerchProductWithInventory } from "@/lib/data/merch";
import { formatMoney } from "@/lib/format";
import { MerchIcon } from "./merch-icon";

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export function ProductGrid({
  products,
}: {
  products: MerchProductWithInventory[];
}) {
  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-6 md:px-10 py-8">
      {products.map((p) => (
        <li key={p.id}>
          <Link
            href={`/merch/${p.id}`}
            className="block bg-surface border border-line hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]"
          >
            <ProductImage
              url={p.image_url}
              title={p.name}
              category={p.category}
            />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-sans text-[14px] font-medium text-fg line-clamp-2 flex-1">
                  {titleCase(p.name)}
                </h3>
                <span
                  className="display-stat text-fg tabular shrink-0"
                  style={{ fontSize: 18, fontWeight: 500 }}
                >
                  {p.price ? formatMoney(p.price, "USD") : "—"}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBracket tone={STATUS_TONE[p.status] ?? "default"}>
                  {MERCH_STATUS_LABEL[p.status]}
                </StatusBracket>
                {p.is_tour_exclusive ? (
                  <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-accent">
                    Tour exclusive
                  </span>
                ) : null}
              </div>
              <div className="mt-2 font-mono text-[11px] text-fg-faint flex flex-wrap gap-x-3">
                {p.sku ? <span className="num">{p.sku}</span> : null}
                <span className="num">
                  {p.total_units} {p.total_units === 1 ? "unit" : "units"}
                </span>
                {p.variants > 0 ? (
                  <span>
                    {p.variants} {p.variants === 1 ? "variant" : "variants"}
                  </span>
                ) : null}
                {p.low_stock ? (
                  <span className="text-holding">low stock</span>
                ) : null}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
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
      <div className="aspect-square grid place-items-center bg-surface-2 border-b border-line">
        <MerchIcon name={title} category={category} size={40} />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} product image`}
      className="aspect-square w-full object-cover border-b border-line"
    />
  );
}
