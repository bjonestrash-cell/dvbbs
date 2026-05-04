"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setAssetStatus } from "../_actions/assets";
import type { AssetStatus } from "@/lib/supabase/types";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";

const OPTIONS: { value: AssetStatus; label: string }[] = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "approved", label: "Approved" },
  { value: "final", label: "Final" },
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
        className="inline-flex items-center gap-1.5 hover:opacity-75 [transition-duration:80ms]"
      >
        <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
          {OPTIONS.find((o) => o.value === optimistic)?.label ?? optimistic}
        </StatusBracket>
        {pending ? (
          <Loader2 className="size-3 animate-spin text-fg-faint" aria-hidden />
        ) : (
          <ChevronDown
            className="size-3 text-fg-faint"
            strokeWidth={1.5}
            aria-hidden
          />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-1 w-44 border border-line bg-surface shadow-[0_4px_12px_rgba(26,22,18,0.06)] right-0"
          onMouseLeave={() => setOpen(false)}
        >
          <ul>
            {OPTIONS.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className="flex w-full items-center px-3 py-2 hover:bg-surface-2 [transition-duration:80ms]"
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
