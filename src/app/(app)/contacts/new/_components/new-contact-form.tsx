"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { newContact, type NewContactState } from "../actions";
import { buttonClasses } from "@/components/ui/button";
import {
  CONTACT_TYPE_LABEL,
  CONTACT_TYPE_ORDER,
} from "@/lib/data/contacts-shared";

const initial: NewContactState = { status: "idle" };

export function NewContactForm() {
  const [state, action, pending] = useActionState(newContact, initial);

  return (
    <form action={action} className="flex flex-col gap-5 px-6 md:px-10 py-8 md:py-10 max-w-2xl form-bottom-pad md:pb-10">
      <Section title="Identity" eyebrow="step 1">
        <Field label="Type" required>
          <select name="type" defaultValue="promoter" className={fieldClass}>
            {CONTACT_TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {CONTACT_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Name" required error={state.errors?.name}>
          <input
            name="name"
            required
            placeholder="Pasquale Rotella"
            className={fieldClass}
          />
        </Field>
        <Field label="Company">
          <input
            name="company"
            placeholder="Insomniac Events"
            className={fieldClass}
          />
        </Field>
      </Section>

      <Section title="Contact" eyebrow="step 2">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Email" error={state.errors?.email}>
            <input
              name="email"
              type="email"
              placeholder="bookings@insomniac.com"
              className={fieldClass}
            />
          </Field>
          <Field label="Phone">
            <input
              name="phone"
              placeholder="+1 ..."
              className={fieldClass}
            />
          </Field>
          <Field label="City">
            <input
              name="city"
              placeholder="Los Angeles"
              className={fieldClass}
            />
          </Field>
          <Field label="Country">
            <input
              name="country"
              placeholder="US"
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Notes" eyebrow="step 3">
        <Field label="Notes">
          <textarea
            name="notes"
            rows={4}
            placeholder="Anything specific. Preferences, history, vibes..."
            className={textareaClass}
          />
        </Field>
      </Section>

      {state.status === "error" && state.message ? (
        <p className="font-sans text-[13px] text-cancelled">{state.message}</p>
      ) : null}

      <div className="flex items-center gap-2 pt-2">
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
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Create contact
            </>
          )}
        </button>
        <Link
          href="/contacts"
          className={buttonClasses({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          Cancel
        </Link>
      </div>
    </form>
  );
}

const fieldClass =
  "h-10 w-full border border-line bg-surface px-3 font-sans text-[14px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

const textareaClass =
  "w-full border border-line bg-surface px-3 py-2 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong resize-y";

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
    <section className="border border-line bg-surface p-5 md:p-6">
      <header className="mb-4">
        <div className="marker">{eyebrow}</div>
        <h2 className="font-display text-[20px] text-fg mt-1">{title}</h2>
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
    <label className="flex flex-col gap-1.5">
      <span className="label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error?.[0] ? (
        <span className="font-sans text-[12px] text-cancelled">
          {error[0]}
        </span>
      ) : null}
    </label>
  );
}
