import { cn } from "@/lib/utils/cn";

/**
 * DVBBS wordmark.
 *
 * Single line: chevron tick + "DVBBS" set in Geist (display) all caps with
 * tight tracking. The "HQ" subtitle was dropped per direction; the brand mark
 * is the artist name.
 */
export function Logo({
  size = "md",
  collapsed = false,
  className,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
  className?: string;
}) {
  const titlePx = TITLE_PX[size];
  // Chevron is slightly smaller than the cap height so it doesn't dominate.
  const chevPx = Math.round(titlePx * 0.85);

  if (collapsed) {
    return (
      <span
        className={cn("inline-flex items-center justify-center", className)}
        style={{ height: titlePx + 4 }}
        aria-label="DVBBS"
      >
        <Chevron size={chevPx} />
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2", className)}
      style={{ height: titlePx + 4 }}
      aria-label="DVBBS"
    >
      <Chevron size={chevPx} />
      <span
        className="font-display"
        style={{
          fontSize: titlePx,
          fontWeight: 700,
          letterSpacing: "-0.035em",
          lineHeight: 1,
        }}
      >
        DVBBS
      </span>
    </span>
  );
}

// Sized to keep the wordmark in conversation with surrounding type. The
// sidebar uses "md" = 22px, which sits at ~1.5x of the 15px nav items —
// a deliberate Apple-grade ratio over the prior 2.0x billboard scale.
const TITLE_PX: Record<"xs" | "sm" | "md" | "lg" | "xl", number> = {
  xs: 16,
  sm: 20,
  md: 22,
  lg: 36,
  xl: 64,
};

/**
 * Brand mark: a stack of three downward-pointing chevron wedges.
 * Filled solid in currentColor, no strokes, sharp corners. Sits as
 * the glyph next to the DVBBS wordmark and as the favicon.
 */
function Chevron({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
      role="presentation"
    >
      <polygon points="0,0 16,6 32,0 32,4 16,10 0,4" />
      <polygon points="0,11 16,17 32,11 32,15 16,21 0,15" />
      <polygon points="0,22 16,28 32,22 32,26 16,32 0,26" />
    </svg>
  );
}

/** Standalone single-chevron glyph for inline use. */
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
      fill="currentColor"
      aria-hidden
      className={className}
      style={{ opacity }}
    >
      <polygon points="0,8 16,18 32,8 32,14 16,24 0,14" />
    </svg>
  );
}
