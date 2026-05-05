"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setProductStatus } from "../actions";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { MerchStatus } from "@/lib/supabase/types";
import { MERCH_STATUS_LABEL } from "@/lib/data/merch-shared";

const ALL: MerchStatus[] = ["draft", "active", "sold_out", "archived"];

export function ProductStatusControl({
  productId,
  status,
}: {
  productId: string;
  status: MerchStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<MerchStatus>(status);

  function pick(next: MerchStatus) {
    if (next === optimistic) {
      setOpen(false);
      return;
    }
    const prev = optimistic;
    setOptimistic(next);
    setOpen(false);
    startTransition(async () => {
      const r = await setProductStatus(productId, next);
      if (!r.ok) setOptimistic(prev);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 h-8 hover:border-line-strong [transition-duration:80ms]"
      >
        <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
          {MERCH_STATUS_LABEL[optimistic]}
        </StatusBracket>
        {pending ? (
          <Loader2 className="size-3 animate-spin text-fg-dim" aria-hidden />
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
          className="absolute z-30 mt-1 w-44 border border-line bg-surface shadow-[0_4px_12px_rgba(26,22,18,0.06)]"
          onMouseLeave={() => setOpen(false)}
        >
          <ul>
            {ALL.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="flex w-full items-center px-3 py-2 hover:bg-surface-2 [transition-duration:80ms]"
                >
                  <StatusBracket tone={STATUS_TONE[s] ?? "default"}>
                    {MERCH_STATUS_LABEL[s]}
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
