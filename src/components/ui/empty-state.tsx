import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { ChevronGlyph } from "@/components/brand/logo";

/**
 * Refined empty state. Sentence case copy on a white surface with a subtle
 * Cormorant ornament above. Generous vertical breathing room.
 */
export function EmptyState({
  title,
  hint,
  description,
  action,
  className,
  icon: _icon,
}: {
  title: string;
  hint?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  /** legacy prop accepted for back compat */
  icon?: React.ReactNode;
}) {
  void _icon;
  const subline = hint ?? description;
  return (
    <div
      className={cn(
        "border border-line bg-surface px-6 py-16 flex flex-col items-center text-center gap-4",
        className,
      )}
    >
      <ChevronGlyph size={20} className="text-fg-faint" opacity={0.6} />
      <div
        className="display-title text-fg"
        style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 300 }}
      >
        {title}
      </div>
      {subline ? (
        <div className="font-sans text-fg-dim text-[13px] max-w-prose">
          {subline}
        </div>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
