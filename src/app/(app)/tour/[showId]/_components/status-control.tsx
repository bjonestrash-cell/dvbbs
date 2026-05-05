"use client";

import { useTransition, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setShowStatus } from "../actions";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { ShowStatus } from "@/lib/supabase/types";

const ALL: { value: ShowStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "offered", label: "Offered" },
  { value: "holding", label: "Holding" },
  { value: "confirmed", label: "Confirmed" },
  { value: "contracted", label: "Contracted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function StatusControl({
  showId,
  status,
}: {
  showId: string;
  status: ShowStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<ShowStatus>(status);

  function pick(next: ShowStatus) {
    if (next === optimistic) {
      setOpen(false);
      return;
    }
    setOptimistic(next);
    setOpen(false);
    startTransition(async () => {
      const r = await setShowStatus(showId, next);
      if (!r.ok) setOptimistic(status);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="marker">Status</span>
      <div className="relative inline-block">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 h-10 md:h-8 hover:border-line-strong [transition-duration:80ms]"
        >
          <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
            {ALL.find((x) => x.value === optimistic)?.label ?? optimistic}
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
            className="absolute left-0 sm:left-auto sm:right-0 z-30 mt-1 w-48 border border-line bg-surface shadow-[0_4px_12px_rgba(26,22,18,0.06)]"
            onMouseLeave={() => setOpen(false)}
          >
            <ul>
              {ALL.map((s) => (
                <li key={s.value}>
                  <button
                    type="button"
                    onClick={() => pick(s.value)}
                    className="flex w-full items-center px-3 py-3 sm:py-2 hover:bg-surface-2 [transition-duration:80ms]"
                  >
                    <StatusBracket tone={STATUS_TONE[s.value] ?? "default"}>
                      {s.label}
                    </StatusBracket>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
