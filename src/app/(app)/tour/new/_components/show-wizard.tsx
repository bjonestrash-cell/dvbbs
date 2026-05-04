"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { createShow, type CreateShowState } from "../actions";
import { buttonClasses } from "@/components/ui/button";
import type { Contact } from "@/lib/supabase/types";

const initial: CreateShowState = { status: "idle" };

const STATUSES = [
  { value: "lead", label: "Lead" },
  { value: "offered", label: "Offered" },
  { value: "holding", label: "Holding" },
  { value: "confirmed", label: "Confirmed" },
  { value: "contracted", label: "Contracted" },
] as const;

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "JPY", "AUD"] as const;

export function ShowWizard({ promoters }: { promoters: Contact[] }) {
  const [state, action, pending] = useActionState(createShow, initial);
  const [promoterMode, setPromoterMode] = useState<"none" | "existing" | "new">(
    "none",
  );
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="flex flex-col gap-6 px-4 md:px-6 py-6 max-w-3xl">
      <Section title="Basics" eyebrow="step 1">
        <Field label="Date" required error={state.errors?.show_date}>
          <input
            type="date"
            name="show_date"
            required
            defaultValue={today}
            className={fieldClass}
          />
        </Field>
        <Field label="Venue" required error={state.errors?.venue_name}>
          <input
            name="venue_name"
            required
            placeholder="Hi Ibiza"
            className={fieldClass}
          />
        </Field>
        <Field label="City" required error={state.errors?.city}>
          <input
            name="city"
            required
            placeholder="Ibiza"
            className={fieldClass}
          />
        </Field>
        <Field label="Country">
          <input name="country" placeholder="ES" className={fieldClass} />
        </Field>
        <Field label="Status">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <label
                key={s.value}
                className="flex items-center gap-1.5 rounded-md border border-line bg-bg-input px-2.5 py-1.5 text-sm has-[:checked]:border-line-strong has-[:checked]:bg-bg-elev cursor-pointer"
              >
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  defaultChecked={s.value === "lead"}
                  className="accent-accent"
                />
                {s.label}
              </label>
            ))}
          </div>
        </Field>
      </Section>

      <Section title="Promoter and deal" eyebrow="step 2">
        <Field label="Promoter">
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { v: "none", l: "None for now" },
              { v: "existing", l: "Existing" },
              { v: "new", l: "Create new" },
            ].map((opt) => (
              <label
                key={opt.v}
                className="flex items-center gap-1.5 rounded-md border border-line bg-bg-input px-2.5 py-1.5 text-sm has-[:checked]:border-line-strong has-[:checked]:bg-bg-elev cursor-pointer"
              >
                <input
                  type="radio"
                  name="promoter_mode"
                  value={opt.v}
                  checked={promoterMode === opt.v}
                  onChange={() =>
                    setPromoterMode(opt.v as "none" | "existing" | "new")
                  }
                  className="accent-accent"
                />
                {opt.l}
              </label>
            ))}
          </div>
          {promoterMode === "existing" ? (
            <select
              name="promoter_contact_id"
              defaultValue=""
              className={fieldClass}
              required={promoterMode === "existing"}
            >
              <option value="" disabled>
                Pick a promoter.
              </option>
              {promoters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.company ? `, ${p.company}` : ""}
                </option>
              ))}
            </select>
          ) : null}
          {promoterMode === "new" ? (
            <div className="grid sm:grid-cols-3 gap-2">
              <input
                name="new_promoter_name"
                placeholder="Name"
                className={fieldClass}
                required={promoterMode === "new"}
              />
              <input
                name="new_promoter_email"
                type="email"
                placeholder="Email"
                className={fieldClass}
              />
              <input
                name="new_promoter_company"
                placeholder="Company"
                className={fieldClass}
              />
            </div>
          ) : null}
          {state.errors?.promoter_contact_id ? (
            <p className="mt-1 text-xs text-accent">
              {state.errors.promoter_contact_id[0]}
            </p>
          ) : null}
          {state.errors?.new_promoter_name ? (
            <p className="mt-1 text-xs text-accent">
              {state.errors.new_promoter_name[0]}
            </p>
          ) : null}
        </Field>

        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Fee offered">
            <input
              name="fee_offered"
              type="number"
              min={0}
              step="100"
              inputMode="numeric"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Currency">
            <select name="currency" defaultValue="USD" className={fieldClass}>
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Capacity">
            <input
              name="capacity"
              type="number"
              min={0}
              step="50"
              inputMode="numeric"
              className={fieldClass + " num"}
            />
          </Field>
        </div>
      </Section>

      <Section title="Detail" eyebrow="step 3">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Region">
            <input name="region" placeholder="Europe" className={fieldClass} />
          </Field>
          <Field label="Timezone">
            <input
              name="timezone"
              placeholder="Europe/Madrid"
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            name="notes"
            placeholder="Anything specific. Rider link, stage plot, key contacts..."
            rows={4}
            className="w-full rounded-md border border-line bg-bg-input px-3 py-2 text-sm placeholder:text-fg-dim outline-none focus:border-line-strong resize-y"
          />
        </Field>
      </Section>

      {state.status === "error" && state.message ? (
        <div className="rounded-md border border-accent/40 bg-accent/10 px-3 py-2 text-sm">
          {state.message}
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary", size: "lg" })}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Creating
            </>
          ) : (
            <>
              <Check className="size-4" aria-hidden />
              Create show
            </>
          )}
        </button>
        <Link
          href="/tour"
          className={buttonClasses({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Cancel
        </Link>
      </div>
    </form>
  );
}

const fieldClass =
  "h-10 w-full rounded-md border border-line bg-bg-input px-3 text-sm text-fg placeholder:text-fg-dim outline-none focus:border-line-strong";

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
      <header className="mb-3">
        <div className="marker">{eyebrow}</div>
        <h2 className="text-base font-medium tracking-tight">{title}</h2>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string[];
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="marker">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error?.[0] ? <span className="text-xs text-accent">{error[0]}</span> : null}
    </label>
  );
}
