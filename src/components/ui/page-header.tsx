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
        <div className="px-6 md:px-10 pt-10 md:pt-14 pb-1">{greeting}</div>
      ) : null}
      <div
        className={cn(
          "px-6 md:px-10 pt-10 md:pt-14 pb-12 md:pb-20 flex flex-col gap-4",
          "sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        )}
      >
        <div className="min-w-0 flex flex-col gap-3">
          {eyebrow ? (
            <div className="font-mono lowercase tracking-[0.06em] text-[12px] text-fg-faint">
              {eyebrow.toLowerCase()}
              <span className="opacity-60"> /</span>
            </div>
          ) : null}
          <h1
            className="display-title text-fg lowercase block break-words"
            style={{
              fontSize: "clamp(56px, 10vw, 96px)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            {title}
          </h1>
          <div
            aria-hidden
            className="h-px w-16 bg-accent mt-2"
          />
          {description ? (
            <div className="font-sans text-fg-dim text-[15px] leading-[1.6] max-w-[520px] mt-1">
              {description}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2 self-start sm:self-end">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
