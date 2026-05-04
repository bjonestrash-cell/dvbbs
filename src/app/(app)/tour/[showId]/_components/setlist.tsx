"use client";

import { useState, useActionState, useEffect } from "react";
import { Plus, X, Loader2, Music, ExternalLink } from "lucide-react";
import { addTrack, removeTrack, initialSetlistState } from "../_actions/setlist";
import { Section, DeleteButton } from "./travel";
import type { ShowSetlist } from "@/lib/supabase/types";

export function Setlist({
  showId,
  setlist,
}: {
  showId: string;
  setlist: ShowSetlist[];
}) {
  const [adding, setAdding] = useState(false);
  const action = addTrack.bind(null, showId);
  const [state, formAction, pending] = useActionState(action, initialSetlistState);
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  return (
    <Section
      eyebrow="setlist"
      title="Track IDs played"
      onAdd={() => setAdding((v) => !v)}
      adding={adding}
    >
      {setlist.length === 0 && !adding ? (
        <p className="text-xs text-fg-dim">No tracks logged.</p>
      ) : null}

      <ol className="flex flex-col gap-1.5">
        {setlist.map((t, i) => (
          <li
            key={t.id}
            className="grid grid-cols-[28px_1fr_auto] items-center gap-3 rounded-md border border-line bg-bg-input px-3 py-2 text-sm"
          >
            <span className="num text-xs text-fg-muted text-right">
              {String(t.position ?? i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex items-center gap-2 flex-wrap">
              <Music className="size-3.5 text-fg-muted shrink-0" aria-hidden />
              <span className="text-fg truncate">{t.track_title ?? "."}</span>
              {t.artist ? (
                <span className="text-fg-muted truncate">. {t.artist}</span>
              ) : null}
              {t.is_unreleased ? (
                <span className="marker text-status-holding">id</span>
              ) : null}
              {t.spotify_url ? (
                <a
                  href={t.spotify_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-0.5 text-xs text-fg-muted hover:text-fg"
                >
                  spotify <ExternalLink className="size-3" aria-hidden />
                </a>
              ) : null}
            </div>
            <DeleteButton onConfirm={async () => { await removeTrack(showId, t.id); }} />
          </li>
        ))}
      </ol>

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-line"
        >
          <Field label="Track" full>
            <input
              name="track_title"
              required
              placeholder="ID"
              className={fieldClass}
            />
          </Field>
          <Field label="Artist">
            <input name="artist" placeholder="DVBBS" className={fieldClass} />
          </Field>
          <Field label="Spotify URL">
            <input
              name="spotify_url"
              type="url"
              placeholder="https://"
              className={fieldClass}
            />
          </Field>
          <Field label="Unreleased ID" full>
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="is_unreleased"
                className="size-4 accent-accent"
              />
              <span>Track is unreleased</span>
            </label>
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
              Add track
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
