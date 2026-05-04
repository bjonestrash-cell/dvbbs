import { cn } from "@/lib/utils/cn";
import type { ShowStatus } from "@/lib/supabase/types";

type Status = ShowStatus | "paid" | "unpaid";

const labels: Record<Status, string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
  paid: "Paid",
  unpaid: "Unpaid",
};

const styles: Record<Status, string> = {
  lead: "bg-status-lead/12 text-status-lead border-status-lead/30",
  offered: "bg-status-offered/12 text-status-offered border-status-offered/30",
  holding: "bg-status-holding/14 text-status-holding border-status-holding/30",
  confirmed: "bg-status-confirmed/14 text-status-confirmed border-status-confirmed/30",
  contracted: "bg-status-contracted/14 text-status-contracted border-status-contracted/30",
  completed: "bg-status-completed/12 text-status-completed border-status-completed/30",
  cancelled: "bg-status-cancelled/14 text-status-cancelled border-status-cancelled/30",
  paid: "bg-status-paid/14 text-status-paid border-status-paid/30",
  unpaid: "bg-status-unpaid/14 text-status-unpaid border-status-unpaid/30",
};

export function StatusPill({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  );
}
