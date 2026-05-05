import { Disc3, ShoppingBag, Shirt } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Type-aware merch placeholder glyph. Picks an icon from the product name +
 * category so the catalog visually distinguishes a hat from a hoodie from a
 * vinyl, while keeping a single design language: 1.5 stroke, no fill, rounded
 * caps, currentColor.
 */
type Kind = "tee" | "hoodie" | "cap" | "vinyl" | "tote" | "crewneck";

function detect(name: string, category: string | null | undefined): Kind {
  const s = `${name} ${category ?? ""}`.toLowerCase();
  if (/hoodie/.test(s)) return "hoodie";
  if (/(crew\s?neck|sweatshirt|sweater)/.test(s)) return "crewneck";
  if (/(snapback|cap|hat|beanie)/.test(s)) return "cap";
  if (/(vinyl|record|7"|12")/.test(s)) return "vinyl";
  if (/(tote|bag|backpack|sack)/.test(s)) return "tote";
  return "tee";
}

export function MerchIcon({
  name,
  category,
  className,
  size = 40,
}: {
  name: string;
  category?: string | null;
  className?: string;
  size?: number;
}) {
  const kind = detect(name, category);
  const cls = cn("text-fg-faint", className);

  switch (kind) {
    case "tee":
      return (
        <Shirt
          className={cls}
          style={{ width: size, height: size }}
          strokeWidth={1.5}
          aria-hidden
        />
      );
    case "hoodie":
      return <HoodieGlyph className={cls} size={size} />;
    case "crewneck":
      return <CrewneckGlyph className={cls} size={size} />;
    case "cap":
      return <CapGlyph className={cls} size={size} />;
    case "vinyl":
      return (
        <Disc3
          className={cls}
          style={{ width: size, height: size }}
          strokeWidth={1.5}
          aria-hidden
        />
      );
    case "tote":
      return (
        <ShoppingBag
          className={cls}
          style={{ width: size, height: size }}
          strokeWidth={1.5}
          aria-hidden
        />
      );
  }
}

function svgProps(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };
}

/**
 * Hoodie: shirt body + hood arc on the shoulders + drawstring tassels at the
 * neckline. Matches the silhouette of lucide's Shirt so the family reads as
 * one set.
 */
function HoodieGlyph({ size, className }: { size: number; className?: string }) {
  return (
    <svg {...svgProps(size, className)}>
      {/* Shirt body */}
      <path d="M5.6 3.5L8.5 2 12 4l3.5-2 2.9 1.5 3.6 4-3 2.5-2-1V21H7V8.9l-2 1L2 7.4z" />
      {/* Hood arc behind the neckline */}
      <path d="M8.5 2c.4 2.2 2 4 3.5 4s3.1-1.8 3.5-4" />
      {/* Drawstrings */}
      <path d="M11 7v3" />
      <path d="M13 7v3" />
    </svg>
  );
}

/**
 * Crewneck: shirt body with a slight ribbed hem implied by a single hairline.
 * No hood, no drawstrings — visually distinct from hoodie at small sizes.
 */
function CrewneckGlyph({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  return (
    <svg {...svgProps(size, className)}>
      {/* Shirt body */}
      <path d="M5.6 3.5L8.5 2 12 4l3.5-2 2.9 1.5 3.6 4-3 2.5-2-1V21H7V8.9l-2 1L2 7.4z" />
      {/* Ribbed hem */}
      <path d="M7 19.5h10" />
    </svg>
  );
}

/**
 * Baseball cap profile: a half-dome crown with a brim sweeping out to the
 * front, plus a small button on the crown.
 */
function CapGlyph({ size, className }: { size: number; className?: string }) {
  return (
    <svg {...svgProps(size, className)}>
      {/* Crown */}
      <path d="M4 14c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      {/* Brim */}
      <path d="M4 14h16c.6 0 1 .4 1 1v1H3v-1c0-.6.4-1 1-1z" />
      {/* Crown button */}
      <circle cx="12" cy="6" r="0.6" />
      {/* Panel seam */}
      <path d="M12 6v8" />
    </svg>
  );
}
