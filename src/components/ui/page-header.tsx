import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Editorial page header. Lowercase mono eyebrow, big lowercase Fraunces
 * title, thin accent rule, Inter sans description. The lowercase rendering
 * is a deliberate confidence move borrowed from underground / DJ branding.
 *
 *   tour /
 *   shows
 *   ───  (thin warm-coffee accent)
 *   Every booking. Hold to wire.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  greeting,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  greeting?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line", className)}>
      {greeting ? (
        <div className="px-6 md:px-10 pt-6 md:pt-12 pb-1">{greeting}</div>
      ) : null}
      <div
        className={cn(
          "px-6 md:px-10 pt-6 md:pt-10 pb-7 md:pb-10 flex flex-col gap-4",
          "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        )}
      >
        <div className="min-w-0 flex flex-col gap-3">
          {eyebrow ? (
            // Eyebrow now matches the .marker convention used elsewhere:
            // mono 10px uppercase tracking 0.14em, role-named for the
            // "tour /" pattern. Replaces the prior 12px lowercase variant
            // that fought the marker style on every other surface.
            <div className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
              {eyebrow}
              <span className="opacity-60"> /</span>
            </div>
          ) : null}
          <h1
            className="display-title text-fg lowercase block break-words"
            style={{
              // Stepped down from clamp(32, 5vw, 56). Mobile starts at 28
              // (was 32) so two-word lowercase titles fit a 360px viewport
              // without wrapping mid-word, and desktop caps at 48 (was 56)
              // so the title sits in conversation with the body content
              // beneath it instead of dominating the surface.
              fontSize: "clamp(28px, 4.5vw, 48px)",
              lineHeight: 1.0,
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </h1>
          <div aria-hidden className="h-px w-16 bg-accent mt-1" />
          {description ? (
            <div className="font-sans text-fg-dim text-[14px] md:text-[15px] leading-[1.55] md:leading-[1.6] max-w-[520px] mt-1">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 self-start sm:shrink-0 sm:self-end sm:flex-nowrap">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
