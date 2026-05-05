"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { createRelease, type NewReleaseState } from "../actions";
import { buttonClasses } from "@/components/ui/button";

const initial: NewReleaseState = { status: "idle" };

const TYPES = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
  { value: "remix", label: "Remix" },
  { value: "edit", label: "Edit" },
  { value: "bootleg", label: "Bootleg" },
] as const;

const STATUSES = [
  { value: "idea", label: "Idea" },
  { value: "in_production", label: "In production" },
  { value: "mixing", label: "Mixing" },
  { value: "mastered", label: "Mastered" },
  { value: "delivered", label: "Delivered" },
  { value: "scheduled", label: "Scheduled" },
] as const;

export function NewReleaseForm() {
  const [state, action, pending] = useActionState(createRelease, initial);

  return (
    <form action={action} className="flex flex-col gap-4 px-6 md:px-10 py-6 md:py-8 max-w-2xl form-bottom-pad md:pb-8">
      <Section title="Track" eyebrow="step 1">
        <Field label="Title" required error={state.errors?.title}>
          <input
            name="title"
            required
            placeholder="Tsunami"
            className={fieldClass}
          />
        </Field>
        <Field label="Type" required>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <label
                key={t.value}
                className="flex items-center gap-1.5 rounded-md border border-line bg-bg-input px-2.5 py-1.5 text-sm has-[:checked]:border-line-strong has-[:checked]:bg-bg-elev cursor-pointer"
              >
                <input
                  type="radio"
                  name="type"
                  value={t.value}
                  defaultChecked={t.value === "single"}
                  className="accent-accent"
                  required
                />
                {t.label}
              </label>
            ))}
          </div>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue="idea" className={fieldClass}>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      <Section title="Release" eyebrow="step 2">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Release date">
            <input
              name="release_date"
              type="date"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Label">
            <input
              name="label"
              placeholder="Spinnin' Records"
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Collaborators">
          <input
            name="collaborators"
            placeholder="Borgeous, Tinashe (comma-separated)"
            className={fieldClass}
          />
        </Field>
      </Section>

      <Section title="Notes" eyebrow="step 3">
        <Field label="Notes">
          <textarea
            name="notes"
            rows={4}
            placeholder="Anything specific. References, BPM, vocal direction..."
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
              Create release
            </>
          )}
        </button>
        <Link
          href="/releases"
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
