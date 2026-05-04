import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-md border border-line bg-bg-surface p-6",
        className,
      )}
    >
      {icon ? <div className="text-fg-muted">{icon}</div> : null}
      <div>
        <div className="font-medium text-fg">{title}</div>
        {description ? (
          <div className="mt-1 text-sm text-fg-muted">{description}</div>
        ) : null}
      </div>
      {action}
    </div>
  );
}
