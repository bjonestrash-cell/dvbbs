"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setMarketingStatus } from "../_actions/marketing";
import type { MarketingStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const OPTIONS: { value: MarketingStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const STYLE: Record<MarketingStatus, string> = {
  todo: "bg-status-lead/12 text-status-lead",
  in_progress: "bg-status-offered/12 text-status-offered",
  done: "bg-status-confirmed/14 text-status-confirmed",
};

const LABEL: Record<MarketingStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

export function MarketingStatusControl({
  taskId,
  releaseSlug,
  status,
}: {
  taskId: string;
  releaseSlug: string;
  status: MarketingStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<MarketingStatus>(status);

  function pick(next: MarketingStatus) {
    if (next === optimistic) {
      setOpen(false);
      return;
    }
    const prev = optimistic;
    setOptimistic(next);
    setOpen(false);
    startTransition(async () => {
      const r = await setMarketingStatus(taskId, releaseSlug, next);
      if (!r.ok) setOptimistic(prev);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm border border-line/40 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide transition-colors hover:border-line-strong",
          STYLE[optimistic],
        )}
      >
        {LABEL[optimistic]}
        {pending ? (
          <Loader2 className="size-3 animate-spin" aria-hidden />
        ) : (
          <ChevronDown className="size-3" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-1 w-36 rounded-md border border-line bg-bg-surface shadow-2xl"
          onMouseLeave={() => setOpen(false)}
        >
          <ul className="p-1">
            {OPTIONS.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
                >
                  {o.label}
                  <span className={cn("inline-block size-2 rounded-full", STYLE[o.value])} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
