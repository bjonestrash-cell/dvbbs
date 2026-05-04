"use client";

import { useTransition, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setShowStatus } from "../actions";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { ShowStatus } from "@/lib/supabase/types";

const ALL: { value: ShowStatus; label: string }[] = [
  { value: "lead", label: "LEAD" },
  { value: "offered", label: "OFFERED" },
  { value: "holding", label: "HOLDING" },
  { value: "confirmed", label: "CONFIRMED" },
  { value: "contracted", label: "CONTRACTED" },
  { value: "completed", label: "COMPLETED" },
  { value: "cancelled", label: "CANCELLED" },
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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 border border-line bg-page px-2 h-7 hover:border-line-strong [transition-duration:80ms]"
      >
        <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
          {ALL.find((x) => x.value === optimistic)?.label ?? optimistic.toUpperCase()}
        </StatusBracket>
        {pending ? (
          <Loader2 className="size-3 animate-spin text-fg-dim" aria-hidden />
        ) : (
          <ChevronDown className="size-3 text-fg-dim" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-1 w-48 border border-line bg-page shadow-2xl"
          onMouseLeave={() => setOpen(false)}
        >
          <ul>
            {ALL.map((s) => (
              <li key={s.value}>
                <button
                  type="button"
                  onClick={() => pick(s.value)}
                  className="flex w-full items-center justify-between px-3 py-2 hover:bg-surface-2 [transition-duration:80ms]"
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
  );
}
