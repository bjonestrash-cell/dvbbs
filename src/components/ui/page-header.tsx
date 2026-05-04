import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Editorial page header. Section marker eyebrow, Cormorant Garamond title in
 * sentence case, Inter sans subline. Generous breathing room.
 *
 *   Tour
 *   Pipeline                                                  [actions slot]
 *   Source of truth for every show, lead through settlement.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  greeting,
  className,
}: {
  /** Section marker rendered as "Tour" above the display title. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  greeting?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("border-b border-line", className)}>
      {greeting ? (
        <div className="px-6 md:px-10 pt-8 md:pt-10 pb-1">{greeting}</div>
      ) : null}
      <div
        className={cn(
          "px-6 md:px-10 pt-8 md:pt-10 pb-10 md:pb-14 flex flex-col gap-3",
          "sm:flex-row sm:items-end sm:justify-between sm:gap-8",
        )}
      >
        <div className="min-w-0 flex flex-col gap-2">
          {eyebrow ? <div className="marker">{eyebrow}</div> : null}
          <h1
            className="display-title text-fg block"
            style={{
              fontSize: "clamp(36px, 6.5vw, 64px)",
            }}
          >
            {title}
          </h1>
          {description ? (
            <p className="font-sans text-fg-dim text-[14px] leading-[1.5] max-w-[480px]">
              {description}
            </p>
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
