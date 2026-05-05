"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteFlight } from "../actions";
import { buttonClasses } from "@/components/ui/button";

export function DeleteFlightButton({ flightId }: { flightId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={buttonClasses({ variant: "danger", size: "sm" })}
      >
        <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
        Delete
      </button>
    );
  }
  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() =>
          startTransition(async () => {
            await deleteFlight(flightId);
          })
        }
        disabled={pending}
        className={buttonClasses({ variant: "danger", size: "sm" })}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
        )}
        Confirm delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className={buttonClasses({ variant: "ghost", size: "sm" })}
      >
        Cancel
      </button>
    </span>
  );
}
