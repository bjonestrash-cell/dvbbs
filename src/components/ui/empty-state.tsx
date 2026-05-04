import * as React from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Brutalist empty state. Uppercase mono, pure black, hairline border,
 * no rounded corners. The copy carries the brand voice; pass it in.
 */
export function EmptyState({
  title,
  hint,
  description,
  action,
  className,
  icon: _icon, // accepted for backward compat, intentionally not rendered
}: {
  title: string;
  hint?: string;
  /** Legacy alias for hint, kept for callsites that haven't migrated. */
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  void _icon;
  const hintText = (hint ?? description)?.toUpperCase();
  return (
    <div
      className={cn(
        "border border-line bg-surface px-6 py-10 flex flex-col items-start gap-3",
        className,
      )}
    >
      <div className="font-mono uppercase tracking-[0.08em] text-[14px] text-fg-dim">
        {title.toUpperCase()}
      </div>
      {hintText ? (
        <div className="marker max-w-prose">{hintText}</div>
      ) : null}
      {action}
    </div>
  );
}
