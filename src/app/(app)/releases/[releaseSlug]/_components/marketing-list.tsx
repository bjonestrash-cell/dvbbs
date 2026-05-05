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
    <div className="px-6 md:px-10 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible -mx-2 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <FilterBracket
            active={filter === "all"}
            count={tasks.length}
            onClick={() => setFilter("all")}
          >
            All
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
                {CHANNEL_LABEL[c]}
              </FilterBracket>
            );
          })}
        </div>
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
              <span>Add task</span>
            </>
          )}
        </button>
      </header>

      {filtered.length === 0 && !adding ? (
        <p className="py-12 text-center font-sans text-[13px] text-fg-faint">
          {filter === "all"
            ? "No marketing tasks yet."
            : "No tasks in this channel."}
        </p>
      ) : null}

      <ul className="border-t border-line">
        {filtered.map((t) => (
          <li
            key={t.id}
            className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_1fr_auto_auto_auto_auto] items-center gap-x-3 gap-y-2 sm:gap-4 py-3 sm:py-4 border-b border-line hover:bg-surface-2 [transition-duration:80ms]"
          >
            <span className="hidden sm:inline font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
              {CHANNEL_LABEL[t.channel]}
            </span>
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="sm:hidden font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                {CHANNEL_LABEL[t.channel]}
              </span>
              <span className="truncate font-sans text-[14px] text-fg">
                {t.task}
              </span>
              <span className="num font-mono text-[11px] text-fg-faint sm:hidden">
                {t.scheduled_for ? formatDateCompact(t.scheduled_for) : ""}
              </span>
            </div>
            <DeleteButton
              onConfirm={async () => {
                await removeMarketing(t.id, releaseSlug);
              }}
            />
            <span className="num font-mono text-[11px] text-fg-faint hidden sm:inline">
              {t.scheduled_for ? formatDateCompact(t.scheduled_for) : ""}
            </span>
            <span className="col-span-2 sm:col-span-1">
              <MarketingStatusControl
                taskId={t.id}
                releaseSlug={releaseSlug}
                status={t.status}
              />
            </span>
            <span className="hidden sm:inline">
              <Monogram value={null} />
            </span>
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 p-6 bg-surface border border-line"
        >
          <Field label="Channel">
            <select
              name="channel"
              defaultValue="instagram"
              className={fieldClass}
            >
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
              <span>Add task</span>
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

function Monogram({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span className="size-6 grid place-items-center rounded-full bg-surface-2 text-fg-faint font-mono text-[10px]">
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
    <span className="size-6 grid place-items-center rounded-full bg-surface-2 text-fg font-mono text-[10px] tracking-[0.04em]">
      {initials}
    </span>
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
