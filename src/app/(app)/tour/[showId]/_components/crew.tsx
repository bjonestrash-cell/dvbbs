"use client";

import { useState, useActionState, useEffect } from "react";
import { Plus, X, Loader2, User } from "lucide-react";
import { addCrew, removeCrew, initialCrewState } from "../_actions/crew";
import { formatMoney } from "@/lib/format";
import { Section, DeleteButton } from "./travel";
import type { Contact, ShowCrew } from "@/lib/supabase/types";

export function Crew({
  showId,
  crew,
  crewContacts,
}: {
  showId: string;
  crew: (ShowCrew & { contact?: Pick<Contact, "name" | "email"> | null })[];
  crewContacts: Contact[];
}) {
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const action = addCrew.bind(null, showId);
  const [state, formAction, pending] = useActionState(action, initialCrewState);
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  return (
    <Section
      eyebrow="crew"
      title="Who is going"
      onAdd={() => setAdding((v) => !v)}
      adding={adding}
    >
      {crew.length === 0 && !adding ? (
        <p className="text-xs text-fg-dim">No crew assigned.</p>
      ) : null}

      <ul className="flex flex-col gap-2">
        {crew.map((c) => (
          <li
            key={c.id}
            className="grid grid-cols-[24px_1fr_auto] items-center gap-3 rounded-md border border-line bg-bg-input px-3 py-2 text-sm"
          >
            <User className="size-4 text-fg-muted" aria-hidden />
            <div className="min-w-0 flex flex-wrap items-baseline gap-x-2">
              <span className="text-fg">{c.contact?.name ?? "Unknown"}</span>
              {c.role ? <span className="text-fg-muted">. {c.role}</span> : null}
              {c.fee ? (
                <span className="num text-xs text-fg-muted">
                  {formatMoney(c.fee, "USD")}
                </span>
              ) : null}
              {c.travel_covered ? (
                <span className="marker">travel covered</span>
              ) : null}
            </div>
            <DeleteButton onConfirm={async () => { await removeCrew(showId, c.id); }} />
          </li>
        ))}
      </ul>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-line"
        >
          <Field label="Person" full>
            <div className="flex flex-wrap gap-2 mb-2">
              {[
                { v: "existing", l: "Existing contact" },
                { v: "new", l: "Create new" },
              ].map((opt) => (
                <label
                  key={opt.v}
                  className="flex items-center gap-1.5 rounded-md border border-line bg-bg-input px-2.5 py-1 text-xs has-[:checked]:border-line-strong has-[:checked]:bg-bg-elev cursor-pointer"
                >
                  <input
                    type="radio"
                    name="mode"
                    value={opt.v}
                    checked={mode === opt.v}
                    onChange={() => setMode(opt.v as "existing" | "new")}
                    className="accent-accent"
                  />
                  {opt.l}
                </label>
              ))}
            </div>
            {mode === "existing" ? (
              <select name="contact_id" defaultValue="" className={fieldClass}>
                <option value="" disabled>
                  Pick a person.
                </option>
                {crewContacts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid sm:grid-cols-2 gap-2">
                <input
                  name="new_name"
                  placeholder="Name"
                  className={fieldClass}
                />
                <input
                  name="new_email"
                  type="email"
                  placeholder="Email"
                  className={fieldClass}
                />
              </div>
            )}
          </Field>
          <Field label="Role">
            <input
              name="role"
              placeholder="Tour manager"
              className={fieldClass}
            />
          </Field>
          <Field label="Fee">
            <input
              name="fee"
              type="number"
              min={0}
              step={50}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Travel">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="travel_covered"
                className="size-4 accent-accent"
              />
              <span>Covered</span>
            </label>
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
              Add crew
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

const fieldClass =
  "h-9 w-full rounded-md border border-line bg-bg-input px-2.5 text-sm text-fg placeholder:text-fg-dim outline-none focus:border-line-strong";

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
