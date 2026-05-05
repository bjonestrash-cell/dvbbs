"use client";

import { useActionState, useState, useTransition } from "react";
import { Pencil, Loader2, Check, X } from "lucide-react";
import { updateShow, initialUpdateShowState } from "../actions";
import type { Show } from "@/lib/supabase/types";
import {
  formatCapacity,
  formatMoney,
} from "@/lib/format";

const fieldClass =
  "h-10 w-full border border-line bg-surface px-3 font-sans text-[14px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

export function AtAGlance({ show }: { show: Show }) {
  const [editing, setEditing] = useState(false);
  const action = updateShow.bind(null, show.id);
  const [state, formAction, pending] = useActionState(
    action,
    initialUpdateShowState,
  );
  const [, startTransition] = useTransition();

  if (editing) {
    return (
      <section className="border border-line-strong bg-surface p-4 md:p-5">
        <header className="mb-3 flex items-center justify-between">
          <div className="marker">at a glance, editing</div>
        </header>
        <form
          action={(fd) => {
            startTransition(() => formAction(fd));
            setEditing(false);
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm"
        >
          <Field label="Doors">
            <input
              name="doors_time"
              type="time"
              defaultValue={show.doors_time ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Set time">
            <input
              name="set_time"
              type="time"
              defaultValue={show.set_time ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Set length min">
            <input
              name="set_length_minutes"
              type="number"
              min={0}
              step={5}
              defaultValue={show.set_length_minutes ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Timezone">
            <input
              name="timezone"
              placeholder="Europe/Madrid"
              defaultValue={show.timezone ?? ""}
              className={fieldClass}
            />
          </Field>
          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              min={0}
              step={50}
              defaultValue={show.capacity ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Fee confirmed">
            <input
              name="fee_confirmed"
              type="number"
              min={0}
              step={100}
              defaultValue={show.fee_confirmed ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Deposit">
            <input
              name="deposit_received"
              type="number"
              min={0}
              step={100}
              defaultValue={show.deposit_received ?? ""}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Currency">
            <select
              name="currency"
              defaultValue={show.currency ?? "USD"}
              className={fieldClass}
            >
              {["USD", "EUR", "GBP", "CAD", "JPY", "AUD"].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Travel covered">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="travel_covered"
                defaultChecked={show.travel_covered}
                className="size-4 accent-accent"
              />
              <span>Yes</span>
            </label>
          </Field>
          <Field label="Hospitality covered">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="hospitality_covered"
                defaultChecked={show.hospitality_covered}
                className="size-4 accent-accent"
              />
              <span>Yes</span>
            </label>
          </Field>

          {state.status === "error" && state.message ? (
            <p className="col-span-full font-sans text-[12px] text-cancelled">{state.message}</p>
          ) : null}

          <div className="col-span-full flex items-center gap-2 pt-2 border-t border-line">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex h-10 items-center gap-2 bg-inverted text-fg-inverted px-4 font-mono uppercase tracking-[0.06em] text-[12px] font-medium [transition-duration:80ms] hover:bg-fg disabled:opacity-60"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" aria-hidden />
              )}
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="inline-flex h-10 items-center gap-2 px-4 font-mono uppercase tracking-[0.06em] text-[12px] text-fg-dim [transition-duration:80ms] hover:text-fg hover:bg-surface-2"
            >
              <X className="size-4" aria-hidden />
              Cancel
            </button>
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="border border-line bg-surface p-4 md:p-5">
      <header className="mb-3 flex items-center justify-between">
        <div className="marker">at a glance</div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex h-8 items-center gap-1.5 px-2 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim [transition-duration:80ms] hover:bg-surface-2 hover:text-fg"
        >
          <Pencil className="size-3" aria-hidden />
          Edit
        </button>
      </header>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <KV label="Doors" value={show.doors_time ?? "."} />
        <KV label="Set time" value={show.set_time ?? "."} />
        <KV
          label="Set length"
          value={show.set_length_minutes ? `${show.set_length_minutes} min` : "."}
        />
        <KV label="Timezone" value={show.timezone ?? "."} />
        <KV label="Capacity" value={formatCapacity(show.capacity)} />
        <KV
          label="Fee"
          value={formatMoney(
            show.fee_confirmed ?? show.fee_offered,
            show.currency,
          )}
        />
        <KV
          label="Deposit"
          value={formatMoney(show.deposit_received, show.currency)}
        />
        <KV
          label="Travel"
          value={show.travel_covered ? "Covered" : "Not covered"}
        />
      </div>
    </section>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="marker">{label}</span>
      <span className="num text-fg">{value}</span>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="marker">{label}</span>
      {children}
    </label>
  );
}
