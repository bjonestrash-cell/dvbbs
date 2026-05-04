"use client";

import { useState, useTransition, useActionState, useEffect } from "react";
import {
  Plane,
  TrainFront,
  Car,
  Ship,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { addTravel, removeTravel, initialTravelState } from "../_actions/travel";
import { formatMoney } from "@/lib/format";
import type { ShowTravel } from "@/lib/supabase/types";
import { format, parseISO } from "date-fns";

const ICONS = {
  flight: Plane,
  train: TrainFront,
  car: Car,
  ferry: Ship,
  other: Car,
};

export function Travel({
  showId,
  travel,
}: {
  showId: string;
  travel: ShowTravel[];
}) {
  const [adding, setAdding] = useState(false);
  const action = addTravel.bind(null, showId);
  const [state, formAction, pending] = useActionState(action, initialTravelState);
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  return (
    <Section
      eyebrow="travel"
      title="Flights, trains, ground"
      onAdd={() => setAdding((v) => !v)}
      adding={adding}
    >
      {travel.length === 0 && !adding ? (
        <p className="text-xs text-fg-dim">No legs yet. Click Add.</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {travel.map((t) => {
          const Icon = ICONS[t.leg_type] ?? Car;
          return (
            <li
              key={t.id}
              className="grid grid-cols-[24px_1fr_auto] items-start gap-3 rounded-md border border-line bg-bg-input px-3 py-2 text-sm"
            >
              <Icon className="mt-0.5 size-4 text-fg-muted" aria-hidden />
              <div className="min-w-0">
                <div className="text-fg">
                  {t.departure_location ?? "?"} <span className="text-fg-dim">to</span> {t.arrival_location ?? "?"}
                </div>
                <div className="mt-0.5 num text-xs text-fg-muted flex flex-wrap gap-x-3">
                  <span>{t.carrier ?? ""}</span>
                  <span>{fmtTime(t.departure_time)}</span>
                  {t.arrival_time ? <span>arr {fmtTime(t.arrival_time)}</span> : null}
                  {t.confirmation_code ? <span>conf {t.confirmation_code}</span> : null}
                  {t.cost ? <span>{formatMoney(t.cost, "USD")}</span> : null}
                </div>
                {t.notes ? (
                  <div className="mt-1 text-xs text-fg-muted">{t.notes}</div>
                ) : null}
              </div>
              <DeleteButton
                onConfirm={async () => {
                  await removeTravel(showId, t.id);
                }}
              />
            </li>
          );
        })}
      </ul>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-line"
        >
          <Field label="Type">
            <select name="leg_type" defaultValue="flight" className={fieldClass}>
              <option value="flight">Flight</option>
              <option value="train">Train</option>
              <option value="car">Car</option>
              <option value="ferry">Ferry</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Carrier">
            <input name="carrier" placeholder="Lufthansa" className={fieldClass} />
          </Field>
          <Field label="From">
            <input name="departure_location" placeholder="JFK" className={fieldClass} />
          </Field>
          <Field label="To">
            <input name="arrival_location" placeholder="AMS" className={fieldClass} />
          </Field>
          <Field label="Departure">
            <input
              name="departure_time"
              type="datetime-local"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Arrival">
            <input
              name="arrival_time"
              type="datetime-local"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Confirmation">
            <input name="confirmation_code" placeholder="ABCDEF" className={fieldClass} />
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
              Add leg
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

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  try {
    return format(parseISO(iso), "EEE LLL d, HH:mm");
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

export function Section({
  eyebrow,
  title,
  children,
  onAdd,
  adding,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  adding?: boolean;
}) {
  return (
    <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <div className="marker">{eyebrow}</div>
          <div className="text-sm text-fg">{title}</div>
        </div>
        {onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
          >
            {adding ? (
              <X className="size-3" aria-hidden />
            ) : (
              <Plus className="size-3" aria-hidden />
            )}
            {adding ? "Close" : "Add"}
          </button>
        ) : null}
      </header>
      {children}
    </section>
  );
}

export function DeleteButton({
  onConfirm,
}: {
  onConfirm: () => Promise<void>;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  if (!confirm) {
    return (
      <button
        type="button"
        onClick={() => setConfirm(true)}
        aria-label="Remove"
        className="size-7 grid place-items-center rounded-md text-fg-dim transition-colors hover:bg-bg-elev hover:text-fg"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await onConfirm();
            setConfirm(false);
          })
        }
        className="h-7 rounded-md bg-status-cancelled/20 px-2 text-xs font-medium text-status-cancelled hover:bg-status-cancelled/30"
      >
        {pending ? <Loader2 className="size-3 animate-spin" /> : "Remove"}
      </button>
      <button
        type="button"
        onClick={() => setConfirm(false)}
        className="h-7 rounded-md px-2 text-xs text-fg-muted hover:bg-bg-elev"
      >
        Keep
      </button>
    </div>
  );
}
