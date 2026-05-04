import { cn } from "@/lib/utils/cn";

/**
 * DVBBS HQ wordmark. Typographic recreation:
 *   - chevron tick mark (filled triangle) on the left
 *   - "DVBBS" set in Anton, uppercase, tight tracking
 *   - "HQ" in Geist Mono below, wider tracking
 *
 * Uses currentColor so it inverts cleanly when the surrounding nav item
 * is in active (white-on-black) state.
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
      <Chevron size={dim - 4} />
      <span className="flex flex-col leading-none">
        <span
          className="font-display uppercase"
          style={{
            fontSize: titlePx,
            letterSpacing: "-0.03em",
            lineHeight: 0.9,
          }}
        >
          DVBBS
        </span>
        <span
          className="font-mono uppercase mt-0.5"
          style={{
            fontSize: subPx,
            letterSpacing: "0.32em",
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
  sm: 24,
  md: 32,
  lg: 48,
  xl: 80,
};
const TITLE_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 18,
  md: 24,
  lg: 36,
  xl: 60,
};
const SUB_PX: Record<"sm" | "md" | "lg" | "xl", number> = {
  sm: 8,
  md: 9,
  lg: 11,
  xl: 14,
};

/** Solid filled chevron tick used as the brand mark glyph. */
function Chevron({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      role="presentation"
    >
      <path
        d="M2 8 L16 22 L30 8 L26 8 L16 18 L6 8 Z"
        fill="currentColor"
      />
      <path
        d="M2 16 L16 30 L30 16 L26 16 L16 26 L6 16 Z"
        fill="currentColor"
        opacity="0.4"
      />
    </svg>
  );
}

/** Standalone chevron for use as a divider/icon. */
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
      <path d="M2 12 L16 26 L30 12 L26 12 L16 22 L6 12 Z" fill="currentColor" />
    </svg>
  );
}
