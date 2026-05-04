import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Editorial page header. Section marker on top, big display title,
 * uppercase mono subline below.
 *
 *   TOUR /
 *   PIPELINE                                              [actions slot]
 *   SOURCE OF TRUTH FOR EVERY SHOW, LEAD THROUGH SETTLEMENT
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  greeting,
  className,
}: {
  /** Section marker rendered as "TOUR /" above the display title. */
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  greeting?: React.ReactNode;
  className?: string;
}) {
  const eyebrowText = eyebrow ? eyebrow.toUpperCase() : null;
  const titleText = title.toUpperCase();
  const descriptionText = description ? description.toUpperCase() : null;

  return (
    <header className={cn("border-b border-line", className)}>
      {greeting ? (
        <div className="px-4 md:px-6 pt-4 pb-1 marker">{greeting}</div>
      ) : null}
      <div
        className={cn(
          "px-4 md:px-6 pt-4 pb-5 md:pt-6 md:pb-8 flex flex-col gap-2",
          "sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        )}
      >
        <div className="min-w-0">
          {eyebrowText ? (
            <div className="marker mb-2 md:mb-3">
              {eyebrowText}
              <span className="opacity-60"> /</span>
            </div>
          ) : null}
          <h1
            className="display-title text-fg block break-words"
            style={{
              fontSize: "clamp(40px, 8vw, 72px)",
            }}
          >
            {titleText}
          </h1>
          {descriptionText ? (
            <p className="marker mt-3 max-w-prose">{descriptionText}</p>
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
