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
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
  className?: string;
}) {
  const titlePx = TITLE_PX[size];
  const chevPx = Math.round(titlePx * 0.95);

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
      className={cn("inline-flex items-center gap-2.5", className)}
      style={{ height: titlePx + 4 }}
      aria-label="DVBBS"
    >
      <Chevron size={chevPx} />
      <span
        className="font-display"
        style={{
          fontSize: titlePx,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1,
        }}
      >
        DVBBS
      </span>
    </span>
  );
}

const TITLE_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 22,
  md: 28,
  lg: 44,
  xl: 72,
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
