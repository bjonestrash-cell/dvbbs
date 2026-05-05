"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

type SyncResult = {
  ok: boolean;
  inserted?: number;
  updated?: number;
  errors?: string[];
  reason?: string;
};

export function BandsintownSync() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncResult | null>(null);

  function run() {
    startTransition(async () => {
      try {
        const r = await fetch("/api/bandsintown/sync", { method: "POST" });
        if (r.ok) {
          const j = (await r.json()) as SyncResult;
          setResult(j);
        } else {
          setResult({ ok: false, reason: `HTTP ${r.status}` });
        }
      } catch (e) {
        setResult({
          ok: false,
          reason: e instanceof Error ? e.message : "Request failed.",
        });
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className={buttonClasses({ variant: "bracket", size: "sm" })}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-3.5" strokeWidth={1.5} aria-hidden />
        )}
        {pending ? "Syncing" : "Sync now"}
      </button>
      {result ? (
        <div
          className={
            "inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.06em] text-[10px] " +
            (result.ok ? "text-confirmed" : "text-cancelled")
          }
        >
          {result.ok ? (
            <Check className="size-3.5" strokeWidth={1.5} aria-hidden />
          ) : (
            <AlertTriangle className="size-3.5" strokeWidth={1.5} aria-hidden />
          )}
          {result.ok
            ? `Inserted ${result.inserted ?? 0} new shows${result.errors?.length ? ` · ${result.errors.length} errors` : ""}`
            : `Failed · ${result.reason ?? "unknown"}`}
        </div>
      ) : null}
    </div>
  );
}
