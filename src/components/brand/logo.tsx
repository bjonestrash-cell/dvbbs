import { cn } from "@/lib/utils/cn";

/**
 * DVBBS HQ wordmark, quiet-luxury treatment.
 *
 * Layout: chevron tick mark (small, refined) on the left, Cormorant Garamond
 * "Dvbbs" in tight tracking, with mono "HQ" stacked below at +0.2em tracking.
 * Uses currentColor so the mark inverts cleanly on hover or active states.
 */
export function Logo({
  size = "md",
  collapsed = false,
  className,
}: {
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
  className?: string;
}) {
  const dim = SIZE_PX[size];
  const titlePx = TITLE_PX[size];
  const subPx = SUB_PX[size];

  if (collapsed) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        style={{ height: dim }}
        aria-label="DVBBS HQ"
      >
        <Chevron size={dim - 4} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      style={{ height: dim }}
      aria-label="DVBBS HQ"
    >
      <Chevron size={dim - 6} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display"
          style={{
            fontSize: titlePx,
            fontWeight: 400,
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          Dvbbs
        </span>
        <span
          className="font-mono uppercase mt-1"
          style={{
            fontSize: subPx,
            letterSpacing: "0.2em",
            color: "var(--color-fg-faint)",
            lineHeight: 1,
          }}
        >
          HQ
        </span>
      </span>
    </span>
  );
}

const SIZE_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 28,
  md: 36,
  lg: 56,
  xl: 80,
};
const TITLE_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 18,
  md: 24,
  lg: 36,
  xl: 56,
};
const SUB_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 8,
  md: 9,
  lg: 11,
  xl: 14,
};

/** Refined chevron tick used as the brand mark glyph. */
function Chevron({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      role="presentation"
      strokeLinecap="square"
    >
      <path
        d="M4 12 L16 22 L28 12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M4 18 L16 28 L28 18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        opacity="0.4"
      />
    </svg>
  );
}

/** Standalone chevron for inline use. */
export function ChevronGlyph({
  size = 12,
  className,
  opacity = 1,
}: {
  size?: number;
  className?: string;
  opacity?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
      style={{ opacity }}
    >
      <path
        d="M4 12 L16 22 L28 12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}
