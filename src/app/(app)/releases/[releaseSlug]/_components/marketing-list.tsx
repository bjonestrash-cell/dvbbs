"use client";

import { useEffect, useState, useActionState } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  addMarketing,
  removeMarketing,
  initialMarketingState,
} from "../_actions/marketing";
import { MarketingStatusControl } from "./marketing-status-control";
import { DeleteButton } from "@/app/(app)/tour/[showId]/_components/travel";
import type { ReleaseMarketing, MarketingChannel } from "@/lib/supabase/types";
import {
  MARKETING_CHANNEL_LABEL as CHANNEL_LABEL,
  MARKETING_CHANNEL_ORDER as CHANNEL_ORDER,
} from "@/lib/data/release-shared";

export function MarketingList({
  releaseId,
  releaseSlug,
  tasks,
}: {
  releaseId: string;
  releaseSlug: string;
  tasks: ReleaseMarketing[];
}) {
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<MarketingChannel | "all">("all");
  const action = addMarketing.bind(null, releaseId, releaseSlug);
  const [state, formAction, pending] = useActionState(
    action,
    initialMarketingState,
  );
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.channel === filter);

  return (
    <div className="rounded-md border border-line bg-bg-surface">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={
              "h-7 rounded-sm border px-2 text-[11px] font-medium uppercase tracking-wide transition-colors " +
              (filter === "all"
                ? "border-line-strong bg-bg-elev text-fg"
                : "border-line text-fg-muted hover:border-line-strong hover:text-fg")
            }
          >
            All ({tasks.length})
          </button>
          {CHANNEL_ORDER.map((c) => {
            const count = tasks.filter((t) => t.channel === c).length;
            if (count === 0) return null;
            const active = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={
                  "h-7 rounded-sm border px-2 text-[11px] font-medium uppercase tracking-wide transition-colors " +
                  (active
                    ? "border-line-strong bg-bg-elev text-fg"
                    : "border-line text-fg-muted hover:border-line-strong hover:text-fg")
                }
              >
                {CHANNEL_LABEL[c]} {count > 0 ? `(${count})` : ""}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
        >
          {adding ? <X className="size-3" /> : <Plus className="size-3" />}
          {adding ? "Close" : "Add task"}
        </button>
      </header>

      {filtered.length === 0 && !adding ? (
        <p className="px-4 py-6 text-xs text-fg-dim text-center">
          {filter === "all"
            ? "No marketing tasks yet. Click Add task."
            : "No tasks in this channel."}
        </p>
      ) : null}

      <ul className="divide-y divide-line">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[80px_1fr_auto_auto_auto] items-center gap-3 px-4 py-2.5 text-sm"
          >
            <span className="marker">{CHANNEL_LABEL[t.channel]}</span>
            <span className="min-w-0 truncate text-fg">{t.task}</span>
            <span className="num text-xs text-fg-muted">
              {t.scheduled_for ?? ""}
            </span>
            <MarketingStatusControl
              taskId={t.id}
              releaseSlug={releaseSlug}
              status={t.status}
            />
            <DeleteButton
              onConfirm={async () => {
                await removeMarketing(t.id, releaseSlug);
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
          <Field label="Channel">
            <select name="channel" defaultValue="instagram" className={fieldClass}>
              {CHANNEL_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="todo" className={fieldClass}>
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>
          </Field>
          <Field label="Task" full>
            <input
              name="task"
              required
              placeholder="Reel teaser, 15s drop preview"
              className={fieldClass}
            />
          </Field>
          <Field label="Scheduled for">
            <input
              name="scheduled_for"
              type="date"
              className={fieldClass + " num"}
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
              Add task
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
