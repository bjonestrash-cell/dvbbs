"use client";

import { useState, useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { deleteRelease } from "../_actions/release";
import { buttonClasses } from "@/components/ui/button";

export function DeleteReleaseButton({
  releaseId,
  title,
}: {
  releaseId: string;
  title: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => {
          setError(null);
          setConfirming(true);
        }}
        className={buttonClasses({ variant: "danger", size: "sm" })}
      >
        <Trash2 className="size-3.5" strokeWidth={1.5} aria-hidden />
        Delete release
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="font-sans text-[12px] text-fg-dim">
        Delete {title}? This is permanent.
      </span>
      <span className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const r = await deleteRelease(releaseId);
              // deleteRelease redirects on success; we only land here on error.
              if (r && !r.ok) setError(r.message ?? "Could not delete.");
            });
          }}
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
      {error ? (
        <span className="font-sans text-[12px] text-cancelled">{error}</span>
      ) : null}
    </div>
  );
}
