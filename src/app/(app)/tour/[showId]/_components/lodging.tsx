"use client";

import { useState, useActionState, useEffect } from "react";
import { Plus, X, Loader2, Bed } from "lucide-react";
import { addLodging, removeLodging, initialLodgingState } from "../_actions/lodging";
import { formatMoney } from "@/lib/format";
import { Section, DeleteButton } from "./travel";
import type { ShowLodging } from "@/lib/supabase/types";
import { format, parseISO } from "date-fns";

export function Lodging({
  showId,
  lodging,
}: {
  showId: string;
  lodging: ShowLodging[];
}) {
  const [adding, setAdding] = useState(false);
  const action = addLodging.bind(null, showId);
  const [state, formAction, pending] = useActionState(
    action,
    initialLodgingState,
  );
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  return (
    <Section
      eyebrow="lodging"
      title="Hotel and address"
      onAdd={() => setAdding((v) => !v)}
      adding={adding}
    >
      {lodging.length === 0 && !adding ? (
        <p className="text-xs text-fg-dim">No accommodation booked.</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {lodging.map((l) => (
          <li
            key={l.id}
            className="grid grid-cols-[24px_1fr_auto] items-start gap-3 rounded-md border border-line bg-bg-input px-3 py-2 text-sm"
          >
            <Bed className="mt-0.5 size-4 text-fg-muted" aria-hidden />
            <div className="min-w-0">
              <div className="text-fg">{l.hotel_name}</div>
              <div className="mt-0.5 num text-xs text-fg-muted flex flex-wrap gap-x-3">
                {l.check_in ? <span>in {fmtDate(l.check_in)}</span> : null}
                {l.check_out ? <span>out {fmtDate(l.check_out)}</span> : null}
                {l.confirmation_code ? <span>conf {l.confirmation_code}</span> : null}
                {l.cost ? <span>{formatMoney(l.cost, "USD")}</span> : null}
              </div>
              {l.address ? (
                <div className="mt-1 text-xs text-fg-muted">{l.address}</div>
              ) : null}
              {l.notes ? (
                <div className="mt-1 text-xs text-fg-muted">{l.notes}</div>
              ) : null}
            </div>
            <DeleteButton onConfirm={async () => { await removeLodging(showId, l.id); }} />
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-line"
        >
          <Field label="Hotel" full>
            <input name="hotel_name" required placeholder="Hotel Pulitzer" className={fieldClass} />
          </Field>
          <Field label="Address" full>
            <input name="address" placeholder="Prinsengracht 315" className={fieldClass} />
          </Field>
          <Field label="Check in">
            <input name="check_in" type="date" className={fieldClass + " num"} />
          </Field>
          <Field label="Check out">
            <input name="check_out" type="date" className={fieldClass + " num"} />
          </Field>
          <Field label="Confirmation">
            <input name="confirmation_code" className={fieldClass} />
          </Field>
          <Field label="Cost">
            <input
              name="cost"
              type="number"
              min={0}
              step={1}
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
              Add hotel
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
    </Section>
  );
}

function fmtDate(iso: string): string {
  try {
    return format(parseISO(iso), "LLL d");
  } catch {
    return iso;
  }
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
