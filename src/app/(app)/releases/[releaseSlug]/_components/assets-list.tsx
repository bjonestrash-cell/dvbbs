"use client";

import { useEffect, useState, useActionState } from "react";
import { Plus, X, Loader2, ExternalLink } from "lucide-react";
import { addAsset, removeAsset, initialAssetState } from "../_actions/assets";
import { AssetStatusControl } from "./asset-status-control";
import { DeleteButton } from "@/app/(app)/tour/[showId]/_components/travel";
import type { ReleaseAsset } from "@/lib/supabase/types";
import {
  ASSET_TYPE_LABEL,
  ASSET_TYPES_ORDER,
} from "@/lib/data/release-shared";
import { asciiProgress, formatDateCompact } from "@/lib/format";

export function AssetsList({
  releaseId,
  releaseSlug,
  assets,
}: {
  releaseId: string;
  releaseSlug: string;
  assets: ReleaseAsset[];
}) {
  const [adding, setAdding] = useState(false);
  const action = addAsset.bind(null, releaseId, releaseSlug);
  const [state, formAction, pending] = useActionState(action, initialAssetState);
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  const total = assets.length;
  const done = assets.filter(
    (a) => a.status === "approved" || a.status === "final",
  ).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="border border-line bg-surface">
      <header className="px-4 md:px-5 py-4 border-b border-line">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <div className="marker">CHECKLIST</div>
            <div className="num font-mono text-[11px] text-fg-dim mt-0.5 uppercase tracking-[0.06em]">
              {done.toString().padStart(2, "0")} OF {total.toString().padStart(2, "0")} APPROVED
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="bracket-text font-mono h-7 inline-flex items-center px-2 border border-line text-fg hover:border-line-strong hover:bg-surface-2 [transition-duration:80ms]"
          >
            <span className="opacity-60">[ </span>
            {adding ? "CLOSE" : "+ ADD ASSET"}
            <span className="opacity-60"> ]</span>
          </button>
        </div>
        <div className="mt-3 num font-mono text-[12px] text-fg leading-none whitespace-pre tracking-[0.05em]">
          {asciiProgress(done, Math.max(total, 1))}
        </div>
      </header>

      {assets.length === 0 && !adding ? (
        <p className="px-4 py-6 marker text-center">
          NO ASSETS TRACKED YET. CLICK ADD.
        </p>
      ) : null}

      <ul className="divide-y divide-line">
        {assets.map((a) => (
          <li
            key={a.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 px-4 md:px-5 py-3 hover:bg-page/40 [transition-duration:80ms]"
          >
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="font-mono uppercase tracking-[0.06em] text-[12px] text-fg truncate">
                {ASSET_TYPE_LABEL[a.asset_type] ?? a.asset_type.toUpperCase()}
              </span>
              {a.notes ? (
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-fg-faint truncate">
                  {a.notes}
                </span>
              ) : null}
            </div>
            <span className="num font-mono text-[10px] text-fg-faint hidden sm:inline">
              {a.due_date ? `DUE ${formatDateCompact(a.due_date)}` : ""}
            </span>
            <span>
              {a.file_url ? (
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="bracket-text font-mono inline-flex items-center gap-1 text-fg hover:text-accent [transition-duration:80ms]"
                >
                  <span className="opacity-60">[</span>FILE
                  <ExternalLink className="size-3" aria-hidden />
                  <span className="opacity-60">]</span>
                </a>
              ) : (
                <span className="bracket-text font-mono text-fg-faint">
                  <span className="opacity-60">[</span>NO FILE
                  <span className="opacity-60">]</span>
                </span>
              )}
            </span>
            <AssetStatusControl
              assetId={a.id}
              releaseSlug={releaseSlug}
              status={a.status}
            />
            <DeleteButton
              onConfirm={async () => {
                await removeAsset(a.id, releaseSlug);
              }}
            />
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 md:p-5 border-t border-line bg-page/40"
        >
          <Field label="TYPE">
            <select
              name="asset_type"
              defaultValue="master_wav"
              className={fieldClass}
            >
              {ASSET_TYPES_ORDER.map((t) => (
                <option key={t} value={t}>
                  {ASSET_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="STATUS">
            <select name="status" defaultValue="not_started" className={fieldClass}>
              <option value="not_started">NOT STARTED</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="review">REVIEW</option>
              <option value="approved">APPROVED</option>
              <option value="final">FINAL</option>
            </select>
          </Field>
          <Field label="DUE DATE">
            <input name="due_date" type="date" className={fieldClass + " num"} />
          </Field>
          <Field label="FILE URL">
            <input
              name="file_url"
              type="url"
              placeholder="https://"
              className={fieldClass}
            />
          </Field>
          <Field label="NOTES" full>
            <textarea name="notes" rows={2} className={textareaClass} />
          </Field>
          {state.status === "error" ? (
            <p className="col-span-full marker text-cancelled">
              {state.message}
            </p>
          ) : null}
          <div className="col-span-full flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="bracket-text font-mono h-9 inline-flex items-center gap-1.5 px-3 border border-line bg-fg text-page hover:bg-accent hover:text-fg disabled:opacity-60 [transition-duration:80ms]"
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              <span>ADD ASSET</span>
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="bracket-text font-mono h-9 inline-flex items-center gap-1.5 px-3 text-fg-dim hover:text-fg hover:bg-surface-2 [transition-duration:80ms]"
            >
              <X className="size-3" />
              CANCEL
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

const fieldClass =
  "h-9 w-full border border-line bg-page px-2.5 font-mono text-[12px] uppercase text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

const textareaClass =
  "w-full border border-line bg-page px-2.5 py-1.5 font-mono text-[12px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong resize-y";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={"flex flex-col gap-1" + (full ? " sm:col-span-2" : "")}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
