"use client";

import { useState, useTransition } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { setFlightStatus } from "../actions";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  FLIGHT_STATUS_LABEL,
  FLIGHT_STATUS_ORDER,
} from "@/lib/data/flights-shared";
import type { FlightStatus } from "@/lib/supabase/types";

export function FlightStatusControl({
  flightId,
  status,
}: {
  flightId: string;
  status: FlightStatus;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<FlightStatus>(status);

  function pick(next: FlightStatus) {
    if (next === optimistic) {
      setOpen(false);
      return;
    }
    setOptimistic(next);
    setOpen(false);
    startTransition(async () => {
      const r = await setFlightStatus(flightId, next);
      if (!r.ok) setOptimistic(status);
    });
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 h-10 md:h-8 hover:border-line-strong [transition-duration:80ms]"
      >
        <StatusBracket tone={STATUS_TONE[optimistic] ?? "default"}>
          {FLIGHT_STATUS_LABEL[optimistic]}
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
            {FLIGHT_STATUS_ORDER.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => pick(s)}
                  className="flex w-full items-center px-3 py-3 sm:py-2 hover:bg-surface-2 [transition-duration:80ms]"
                >
                  <StatusBracket tone={STATUS_TONE[s] ?? "default"}>
                    {FLIGHT_STATUS_LABEL[s]}
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
