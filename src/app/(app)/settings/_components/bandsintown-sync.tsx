"use client";

import { useState, useTransition } from "react";
import { Loader2, RefreshCw, Check, AlertTriangle } from "lucide-react";

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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="self-start inline-flex h-9 items-center gap-1.5 border border-line bg-surface px-3 text-sm [transition-duration:80ms] hover:border-line-strong disabled:opacity-50"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="size-4" aria-hidden />
        )}
        {pending ? "Syncing" : "Sync Bandsintown now"}
      </button>
      {result ? (
        <div
          className={
            "text-xs flex items-center gap-1.5 " +
            (result.ok ? "text-status-confirmed" : "text-status-cancelled")
          }
        >
          {result.ok ? (
            <Check className="size-3.5" aria-hidden />
          ) : (
            <AlertTriangle className="size-3.5" aria-hidden />
          )}
          {result.ok
            ? `Inserted ${result.inserted ?? 0} new shows.${result.errors?.length ? ` ${result.errors.length} errors.` : ""}`
            : `Failed: ${result.reason ?? "unknown"}`}
        </div>
      ) : null}
    </div>
  );
}
