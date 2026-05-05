"use client";

import { useActionState, useEffect, useState } from "react";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/release-shared";
import type { Release } from "@/lib/supabase/types";
import {
  updateRelease,
  type UpdateReleaseState,
} from "../_actions/release";
import { cn } from "@/lib/utils/cn";

const initial: UpdateReleaseState = { status: "idle" };

const TYPE_OPTIONS = [
  { value: "single", label: "Single" },
  { value: "ep", label: "EP" },
  { value: "album", label: "Album" },
  { value: "remix", label: "Remix" },
  { value: "edit", label: "Edit" },
  { value: "bootleg", label: "Bootleg" },
] as const;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function ReleaseEditForm({ release }: { release: Release }) {
  const action = updateRelease.bind(null, release.id, release.slug);
  const [state, formAction, pending] = useActionState(action, initial);

  // Local mirror of fields so we can show the auto-slug + dirty indicator.
  const [title, setTitle] = useState(release.title);
  const [slug, setSlug] = useState(release.slug);
  const [slugTouched, setSlugTouched] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  // Keep the slug in sync with the title until the user edits it manually.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  // Surface a "Saved" indicator briefly after a successful save.
  useEffect(() => {
    if (state.status === "ok") setSavedAt(new Date());
  }, [state.status]);

  function reset() {
    setTitle(release.title);
    setSlug(release.slug);
    setSlugTouched(false);
  }

  return (
    <form
      action={formAction}
      className="border border-line bg-surface p-5 md:p-6 flex flex-col gap-5"
    >
      <header className="flex items-baseline justify-between gap-3 pb-3 border-b border-line">
        <div>
          <div className="marker">Edit details</div>
          <h2 className="font-display text-[18px] text-fg mt-1" style={{ fontWeight: 500 }}>
            Track info
          </h2>
        </div>
        {savedAt ? (
          <span className="font-mono uppercase tracking-[0.06em] text-[10px] text-confirmed inline-flex items-center gap-1">
            <Check className="size-3" strokeWidth={2} aria-hidden />
            Saved
          </span>
        ) : null}
      </header>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Title" required error={state.errors?.title} full>
          <input
            name="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Slug" required error={state.errors?.slug}>
          <input
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder={slugify(title)}
            className={fieldClass + " num"}
          />
          {slugTouched ? (
            <button
              type="button"
              onClick={() => {
                setSlugTouched(false);
                setSlug(slugify(title));
              }}
              className="self-start mt-1 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint hover:text-fg [transition-duration:80ms]"
            >
              <RotateCcw className="size-3" strokeWidth={1.5} aria-hidden />
              Auto from title
            </button>
          ) : null}
        </Field>

        <Field label="Type" required>
          <select
            name="type"
            defaultValue={release.type}
            className={fieldClass}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status" required>
          <select
            name="status"
            defaultValue={release.status}
            className={fieldClass}
          >
            {RELEASE_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {RELEASE_STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Release date">
          <input
            name="release_date"
            type="date"
            defaultValue={release.release_date ?? ""}
            className={fieldClass + " num"}
          />
        </Field>
        <Field label="Label">
          <input
            name="label"
            defaultValue={release.label ?? ""}
            placeholder="Big Beat Records"
            className={fieldClass}
          />
        </Field>

        <Field label="Collaborators" full>
          <input
            name="collaborators"
            defaultValue={release.collaborators?.join(", ") ?? ""}
            placeholder="Comma-separated, e.g. Borgeous, A-Trak"
            className={fieldClass}
          />
        </Field>

        <Field label="ISRC">
          <input
            name="isrc"
            defaultValue={release.isrc ?? ""}
            placeholder="USRC1700001"
            autoCapitalize="characters"
            className={fieldClass + " num uppercase"}
          />
        </Field>
        <Field label="UPC">
          <input
            name="upc"
            defaultValue={release.upc ?? ""}
            placeholder="012345678901"
            className={fieldClass + " num"}
          />
        </Field>

        <Field label="Smart link slug" error={state.errors?.smart_link_slug}>
          <input
            name="smart_link_slug"
            defaultValue={release.smart_link_slug ?? ""}
            placeholder="tsunami-2026"
            className={fieldClass + " num"}
          />
        </Field>
        <Field label="Spotify URL" error={state.errors?.spotify_url}>
          <input
            name="spotify_url"
            type="url"
            defaultValue={release.spotify_url ?? ""}
            placeholder="https://open.spotify.com/..."
            className={fieldClass}
          />
        </Field>

        <Field label="Apple Music URL" error={state.errors?.apple_url} full>
          <input
            name="apple_url"
            type="url"
            defaultValue={release.apple_url ?? ""}
            placeholder="https://music.apple.com/..."
            className={fieldClass}
          />
        </Field>

        <Field label="Notes" full>
          <textarea
            name="notes"
            rows={4}
            defaultValue={release.notes ?? ""}
            placeholder="Production notes, splits, references..."
            className={textareaClass}
          />
        </Field>
      </div>

      {state.status === "error" && state.message ? (
        <p className="font-sans text-[13px] text-cancelled">{state.message}</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary", size: "md" })}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving
            </>
          ) : (
            <>
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Save changes
            </>
          )}
        </button>
        <button
          type="button"
          onClick={reset}
          className={buttonClasses({ variant: "ghost", size: "md" })}
        >
          Reset
        </button>
      </div>
    </form>
  );
}

const fieldClass =
  "h-10 w-full border border-line bg-surface px-3 font-sans text-[14px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

const textareaClass =
  "w-full border border-line bg-surface px-3 py-2 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong resize-y";

function Field({
  label,
  children,
  required,
  error,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string[];
  full?: boolean;
}) {
  return (
    <label
      className={cn(
        "flex flex-col gap-1.5 min-w-0",
        full ? "sm:col-span-2" : "",
      )}
    >
      <span className="label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error?.[0] ? (
        <span className="font-sans text-[12px] text-cancelled">{error[0]}</span>
      ) : null}
    </label>
  );
}
