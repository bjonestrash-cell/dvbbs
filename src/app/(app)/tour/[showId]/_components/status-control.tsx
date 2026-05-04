"use client";

import { useTransition, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setShowStatus } from "../actions";
import { StatusPill } from "@/components/ui/status-pill";
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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md border border-line bg-bg-surface px-1.5 py-0.5 transition-colors hover:border-line-strong"
      >
        <StatusPill status={optimistic} />
        {pending ? (
          <Loader2 className="size-3 animate-spin text-fg-muted" aria-hidden />
        ) : (
          <ChevronDown className="size-3 text-fg-muted" aria-hidden />
        )}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute z-30 mt-1 w-44 rounded-md border border-line bg-bg-surface shadow-2xl"
          onMouseLeave={() => setOpen(false)}
        >
          <ul className="p-1">
            {ALL.map((s) => (
              <li key={s.value}>
                <button
                  type="button"
                  onClick={() => pick(s.value)}
                  className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
                >
                  <span>{s.label}</span>
                  <StatusPill status={s.value} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
