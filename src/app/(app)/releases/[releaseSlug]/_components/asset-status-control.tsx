"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setAssetStatus } from "../_actions/assets";
import type { AssetStatus } from "@/lib/supabase/types";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";

const OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "not_started", label: "NOT STARTED" },
  { value: "in_progress", label: "IN PROGRESS" },
  { value: "review", label: "REVIEW" },
  { value: "approved", label: "APPROVED" },
  { value: "final", label: "FINAL" },
];

export function AssetStatusControl({
  assetId,
  releaseSlug,
  status,
}: {
  assetId: string;
  releaseSlug: string;
  status: AssetStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<AssetStatus>(status);

  function pick(next: AssetStatus) {
    if (next === optimistic) {
      setOpen(false);
      return;
    }
    const prev = optimistic;
    setOptimistic(next);
    setOpen(false);
    startTransition(async () => {
      const r = await setAssetStatus(assetId, releaseSlug, next);
      if (!r.ok) setOptimistic(prev);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 border border-line bg-page px-1.5 h-6 hover:border-line-strong [transition-duration:80ms]"
      >
        <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
          {OPTIONS.find((o) => o.value === optimistic)?.label ??
            optimistic.toUpperCase()}
        </StatusBracket>
        {pending ? (
          <Loader2 className="size-2.5 animate-spin text-fg-dim" aria-hidden />
        ) : (
          <ChevronDown className="size-2.5 text-fg-dim" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-1 w-44 border border-line bg-page shadow-2xl right-0"
          onMouseLeave={() => setOpen(false)}
        >
          <ul>
            {OPTIONS.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className="flex w-full items-center justify-start px-3 py-1.5 hover:bg-surface-2 [transition-duration:80ms]"
                >
                  <StatusBracket tone={STATUS_TONE[o.value] ?? "default"}>
                    {o.label}
                  </StatusBracket>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
