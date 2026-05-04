"use client";

import { useEffect, useState, useActionState } from "react";
import { Plus, X, Loader2, ArrowRight } from "lucide-react";
import { addAsset, removeAsset, initialAssetState } from "../_actions/assets";
import { AssetStatusControl } from "./asset-status-control";
import { DeleteButton } from "@/app/(app)/tour/[showId]/_components/travel";
import type { ReleaseAsset } from "@/lib/supabase/types";
import {
  ASSET_TYPE_LABEL,
  ASSET_TYPES_ORDER,
} from "@/lib/data/release-shared";
import { formatDateCompact, progressRatio } from "@/lib/format";

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
  const ratio = progressRatio(done, Math.max(total, 1));
  const pct = Math.round(ratio * 100);

  return (
    <div className="px-6 md:px-10 py-8">
      <header className="mb-6">
        <div className="font-sans text-[14px] text-fg">
          {done} of {total} assets approved
        </div>
        <div className="mt-3 h-[2px] w-full bg-surface-2 overflow-hidden">
          <div
            className="h-full bg-accent [transition-duration:80ms]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 num font-mono text-[11px] text-fg-faint">{pct}%</div>
      </header>

      <div className="flex justify-end mb-3">
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim hover:text-fg [transition-duration:80ms]"
        >
          {adding ? (
            <>
              <X className="size-3" strokeWidth={1.5} aria-hidden />
              <span>Close</span>
            </>
          ) : (
            <>
              <Plus className="size-3" strokeWidth={1.5} aria-hidden />
              <span>Add asset</span>
            </>
          )}
        </button>
      </div>

      {assets.length === 0 && !adding ? (
        <p className="py-12 text-center font-sans text-[13px] text-fg-faint">
          No assets tracked yet.
        </p>
      ) : null}

      <ul className="border-t border-line">
        {assets.map((a) => (
          <li
            key={a.id}
            className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 py-4 border-b border-line hover:bg-surface-2 [transition-duration:80ms]"
          >
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="font-sans text-[14px] text-fg truncate">
                {ASSET_TYPE_LABEL[a.asset_type] ?? a.asset_type}
              </span>
              {a.notes ? (
                <span className="font-sans text-[12px] text-fg-faint truncate">
                  {a.notes}
                </span>
              ) : null}
            </div>
            <span className="num font-mono text-[11px] text-fg-faint hidden sm:inline">
              {a.due_date ? `Due ${formatDateCompact(a.due_date)}` : ""}
            </span>
            <span>
              {a.file_url ? (
                <a
                  href={a.file_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim hover:text-fg [transition-duration:80ms]"
                >
                  <span>View</span>
                  <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
                </a>
              ) : (
                <span className="font-mono uppercase tracking-[0.06em] text-[11px] text-fg-faint">
                  No file
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 p-6 bg-surface border border-line"
        >
          <Field label="Type">
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
          <Field label="Status">
            <select name="status" defaultValue="not_started" className={fieldClass}>
              <option value="not_started">Not started</option>
              <option value="in_progress">In progress</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="final">Final</option>
            </select>
          </Field>
          <Field label="Due date">
            <input name="due_date" type="date" className={fieldClass + " num"} />
          </Field>
          <Field label="File URL">
            <input
              name="file_url"
              type="url"
              placeholder="https://"
              className={fieldClass}
            />
          </Field>
          <Field label="Notes" full>
            <textarea name="notes" rows={2} className={textareaClass} />
          </Field>
          {state.status === "error" ? (
            <p className="col-span-full font-sans text-[12px] text-cancelled">
              {state.message}
            </p>
          ) : null}
          <div className="col-span-full flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="font-mono uppercase tracking-[0.06em] text-[11px] inline-flex items-center gap-1.5 h-9 px-4 bg-inverted text-fg-inverted hover:bg-fg disabled:opacity-60 [transition-duration:80ms]"
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" strokeWidth={1.5} />}
              <span>Add asset</span>
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="font-mono uppercase tracking-[0.06em] text-[11px] inline-flex items-center gap-1.5 h-9 px-3 text-fg-dim hover:text-fg hover:bg-surface-2 [transition-duration:80ms]"
            >
              <X className="size-3" strokeWidth={1.5} />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

const fieldClass =
  "h-9 w-full border border-line bg-surface px-3 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

const textareaClass =
  "w-full border border-line bg-surface px-3 py-2 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong resize-y";

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
    <label className={"flex flex-col gap-1.5" + (full ? " sm:col-span-2" : "")}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
