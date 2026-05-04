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
import { FilterBracket } from "@/components/ui/status-bracket";
import { formatDateCompact } from "@/lib/format";

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
    <div className="border border-line bg-surface">
      <header className="px-4 md:px-5 py-3 border-b border-line">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1 flex-wrap overflow-x-auto -mx-1 px-1">
            <FilterBracket
              active={filter === "all"}
              count={tasks.length}
              onClick={() => setFilter("all")}
            >
              ALL
            </FilterBracket>
            {CHANNEL_ORDER.map((c) => {
              const count = tasks.filter((t) => t.channel === c).length;
              if (count === 0) return null;
              return (
                <FilterBracket
                  key={c}
                  active={filter === c}
                  count={count}
                  onClick={() => setFilter(c)}
                >
                  {CHANNEL_LABEL[c].toUpperCase()}
                </FilterBracket>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setAdding((v) => !v)}
            className="bracket-text font-mono h-7 inline-flex items-center px-2 border border-line text-fg hover:border-line-strong hover:bg-surface-2 [transition-duration:80ms]"
          >
            <span className="opacity-60">[ </span>
            {adding ? "CLOSE" : "+ ADD TASK"}
            <span className="opacity-60"> ]</span>
          </button>
        </div>
      </header>

      {filtered.length === 0 && !adding ? (
        <p className="px-4 py-6 marker text-center">
          {filter === "all"
            ? "NO MARKETING TASKS YET. CLICK ADD TASK."
            : "NO TASKS IN THIS CHANNEL."}
        </p>
      ) : null}

      <ul className="divide-y divide-line">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[80px_1fr_auto_auto_auto] items-center gap-3 px-4 md:px-5 py-3 hover:bg-page/40 [transition-duration:80ms]"
          >
            <span className="font-mono uppercase tracking-[0.08em] text-[10px] text-fg-dim">
              {CHANNEL_LABEL[t.channel].toUpperCase()}
            </span>
            <span className="min-w-0 truncate font-mono text-[12px] text-fg uppercase tracking-[0.04em]">
              {t.task}
            </span>
            <span className="num font-mono text-[10px] text-fg-faint hidden sm:inline">
              {t.scheduled_for ? formatDateCompact(t.scheduled_for) : ""}
            </span>
            <MarketingStatusControl
              taskId={t.id}
              releaseSlug={releaseSlug}
              status={t.status}
            />
            <Monogram value={null} />
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
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 md:p-5 border-t border-line bg-page/40"
        >
          <Field label="CHANNEL">
            <select
              name="channel"
              defaultValue="instagram"
              className={fieldClass}
            >
              {CHANNEL_ORDER.map((c) => (
                <option key={c} value={c}>
                  {CHANNEL_LABEL[c].toUpperCase()}
                </option>
              ))}
            </select>
          </Field>
          <Field label="STATUS">
            <select name="status" defaultValue="todo" className={fieldClass}>
              <option value="todo">TO DO</option>
              <option value="in_progress">IN PROGRESS</option>
              <option value="done">DONE</option>
            </select>
          </Field>
          <Field label="TASK" full>
            <input
              name="task"
              required
              placeholder="Reel teaser, 15s drop preview"
              className={fieldClass}
            />
          </Field>
          <Field label="SCHEDULED FOR">
            <input
              name="scheduled_for"
              type="date"
              className={fieldClass + " num"}
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
              <span>ADD TASK</span>
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

function Monogram({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span className="size-6 grid place-items-center border border-line text-fg-faint font-mono text-[9px]">
        —
      </span>
    );
  }
  const initials = value
    .split(/[\s.@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <span className="size-6 grid place-items-center border border-line text-fg font-mono text-[10px] uppercase tracking-[0.04em]">
      {initials}
    </span>
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
