import { cn } from "@/lib/utils/cn";
import type { ReleaseStatus } from "@/lib/supabase/types";

const labels: Record<ReleaseStatus, string> = {
  idea: "Idea",
  in_production: "In production",
  mixing: "Mixing",
  mastered: "Mastered",
  delivered: "Delivered",
  scheduled: "Scheduled",
  released: "Released",
  archived: "Archived",
};

const styles: Record<ReleaseStatus, string> = {
  idea: "bg-status-lead/12 text-status-lead border-status-lead/30",
  in_production: "bg-status-offered/12 text-status-offered border-status-offered/30",
  mixing: "bg-status-offered/12 text-status-offered border-status-offered/30",
  mastered: "bg-status-holding/14 text-status-holding border-status-holding/30",
  delivered: "bg-status-confirmed/14 text-status-confirmed border-status-confirmed/30",
  scheduled: "bg-status-confirmed/14 text-status-confirmed border-status-confirmed/30",
  released: "bg-status-contracted/14 text-status-contracted border-status-contracted/30",
  archived: "bg-status-completed/12 text-status-completed border-status-completed/30",
};

export function ReleaseStatusPill({
  status,
  className,
}: {
  status: ReleaseStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center border px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
