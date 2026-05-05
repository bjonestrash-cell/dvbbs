"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { createSmartLink, type NewLinkState } from "../actions";
import { buttonClasses } from "@/components/ui/button";
import type { Release } from "@/lib/supabase/types";

const initial: NewLinkState = { status: "idle" };

export function NewLinkForm({ releases }: { releases: Release[] }) {
  const [state, action, pending] = useActionState(createSmartLink, initial);
  const [releaseId, setReleaseId] = useState<string>("");

  const release = releases.find((r) => r.id === releaseId);

  return (
    <form action={action} className="flex flex-col gap-4 px-6 md:px-10 py-6 md:py-8 max-w-2xl form-bottom-pad md:pb-8">
      <Section title="Slug" eyebrow="step 1">
        <Field label="Slug" required error={state.errors?.slug}>
          <input
            name="slug"
            required
            placeholder="roadtrip"
            pattern="[a-z0-9-]+"
            className={fieldClass + " num"}
          />
        </Field>
        <p className="text-xs text-fg-dim">
          Public URL will be /link/your-slug. Lowercase, dashes only.
        </p>
      </Section>

      <Section title="Source release" eyebrow="step 2 (optional)">
        <Field label="Link to release">
          <select
            name="release_id"
            value={releaseId}
            onChange={(e) => setReleaseId(e.target.value)}
            className={fieldClass}
          >
            <option value="">None, custom destinations only</option>
            {releases.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </Field>
        {release ? (
          <p className="text-xs text-fg-muted">
            Pre-fill below from <span className="text-fg">{release.title}</span>, or override per platform.
          </p>
        ) : null}
        <Field label="Title">
          <input
            name="title"
            defaultValue={release?.title ?? ""}
            placeholder="Roadtrip, with A-Trak"
            className={fieldClass}
          />
        </Field>
      </Section>

      <Section title="Destinations" eyebrow="step 3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Spotify">
            <input
              name="spotify"
              type="url"
              defaultValue={release?.spotify_url ?? ""}
              placeholder="https://open.spotify.com/..."
              className={fieldClass}
            />
          </Field>
          <Field label="Apple Music">
            <input
              name="apple"
              type="url"
              defaultValue={release?.apple_url ?? ""}
              placeholder="https://music.apple.com/..."
              className={fieldClass}
            />
          </Field>
          <Field label="SoundCloud">
            <input
              name="soundcloud"
              type="url"
              defaultValue={release?.soundcloud_url ?? ""}
              placeholder="https://soundcloud.com/..."
              className={fieldClass}
            />
          </Field>
          <Field label="YouTube">
            <input
              name="youtube"
              type="url"
              defaultValue={release?.youtube_url ?? ""}
              placeholder="https://youtube.com/..."
              className={fieldClass}
            />
          </Field>
          <Field label="Beatport">
            <input
              name="beatport"
              type="url"
              defaultValue={release?.beatport_url ?? ""}
              placeholder="https://beatport.com/..."
              className={fieldClass}
            />
          </Field>
        </div>
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
              Create link
            </>
          )}
        </button>
        <Link
          href="/releases/links"
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
