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
    <div className="rounded-md border border-line bg-bg-surface">
      <header className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div>
          <div className="marker">checklist</div>
          <div className="num text-xs text-fg-muted">
            {done} of {total} approved
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="h-1.5 w-32 rounded-full bg-bg-elev overflow-hidden">
              <div
                className="h-full bg-status-confirmed transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="num text-xs text-fg-muted w-8 text-right">
              {pct}%
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
          >
            {adding ? <X className="size-3" /> : <Plus className="size-3" />}
            {adding ? "Close" : "Add"}
          </button>
        </div>
      </header>

      {assets.length === 0 && !adding ? (
        <p className="px-4 py-6 text-xs text-fg-dim text-center">
          No assets tracked yet. Click Add.
        </p>
      ) : null}

      <ul className="divide-y divide-line">
        {assets.map((a) => (
          <li
            key={a.id}
            className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-sm"
          >
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="truncate text-fg">
                {ASSET_TYPE_LABEL[a.asset_type] ?? a.asset_type}
              </span>
              <span className="text-[11px] text-fg-muted flex items-center gap-2 flex-wrap">
                {a.due_date ? (
                  <span className="num">due {a.due_date}</span>
                ) : null}
                {a.file_url ? (
                  <a
                    href={a.file_url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-0.5 hover:text-fg"
                  >
                    file <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : null}
                {a.notes ? <span className="truncate">{a.notes}</span> : null}
              </span>
            </div>
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 border-t border-line bg-bg-base/40"
        >
          <Field label="Type">
            <select name="asset_type" defaultValue="master_wav" className={fieldClass}>
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
            <p className="col-span-full text-xs text-accent">{state.message}</p>
          ) : null}
          <div className="col-span-full flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-accent px-3 text-sm font-medium text-accent-fg hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
              Add asset
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm text-fg-muted hover:bg-bg-elev"
            >
              <X className="size-4" />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}

const fieldClass =
  "h-9 w-full rounded-md border border-line bg-bg-input px-2.5 text-sm text-fg placeholder:text-fg-dim outline-none focus:border-line-strong";

const textareaClass =
  "w-full rounded-md border border-line bg-bg-input px-2.5 py-1.5 text-sm text-fg placeholder:text-fg-dim outline-none focus:border-line-strong resize-y";

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
      <span className="marker">{label}</span>
      {children}
    </label>
  );
}
