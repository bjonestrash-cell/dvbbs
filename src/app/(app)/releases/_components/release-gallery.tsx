"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/release-shared";
import {
  StatusBracket,
  STATUS_TONE,
  FilterBracket,
} from "@/components/ui/status-bracket";
import type { Release, ReleaseStatus } from "@/lib/supabase/types";
import { formatDateCompact, formatYear } from "@/lib/format";
import { cn } from "@/lib/utils/cn";

const TYPE_LABEL: Record<Release["type"], string> = {
  single: "Single",
  ep: "EP",
  album: "Album",
  remix: "Remix",
  edit: "Edit",
  bootleg: "Bootleg",
};

/** Background gradient per status for the cover-art fallback. Uses the
 *  same status palette as the dot indicators so a glance at the wall of
 *  cards instantly reads the catalog spread. */
const STATUS_GRADIENT: Record<ReleaseStatus, string> = {
  idea:
    "linear-gradient(135deg, var(--color-surface-2) 0%, color-mix(in srgb, var(--color-lead) 40%, var(--color-surface)) 100%)",
  in_production:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-holding) 18%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-holding) 50%, var(--color-surface-2)) 100%)",
  mixing:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-offered) 18%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-offered) 55%, var(--color-surface-2)) 100%)",
  mastered:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-holding) 25%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-accent) 55%, var(--color-surface-2)) 100%)",
  delivered:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-approved) 22%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-accent) 50%, var(--color-surface-2)) 100%)",
  scheduled:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 30%, var(--color-surface)) 0%, color-mix(in srgb, var(--color-accent) 70%, var(--color-inverted)) 100%)",
  released:
    "linear-gradient(135deg, color-mix(in srgb, var(--color-accent) 65%, var(--color-inverted)) 0%, var(--color-inverted) 100%)",
  archived:
    "linear-gradient(135deg, var(--color-surface-2) 0%, color-mix(in srgb, var(--color-completed) 40%, var(--color-surface-2)) 100%)",
};

function sentenceCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export function ReleaseGallery({ releases }: { releases: Release[] }) {
  const [filter, setFilter] = useState<ReleaseStatus | "all">("all");

  const counts: Record<ReleaseStatus, number> = {
    idea: 0,
    in_production: 0,
    mixing: 0,
    mastered: 0,
    delivered: 0,
    scheduled: 0,
    released: 0,
    archived: 0,
  };
  for (const r of releases) counts[r.status]++;

  const filtered =
    filter === "all" ? releases : releases.filter((r) => r.status === filter);

  // Sort: scheduled by upcoming date, released newest-first, others by title.
  const sorted = [...filtered].sort((a, b) => {
    if (a.status === "released" && b.status === "released") {
      return (b.release_date ?? "").localeCompare(a.release_date ?? "");
    }
    if (a.status === "scheduled" && b.status === "scheduled") {
      return (a.release_date ?? "").localeCompare(b.release_date ?? "");
    }
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="px-6 md:px-10 py-6 flex flex-col gap-6">
      {/* Filter chips */}
      <div className="flex flex-nowrap sm:flex-wrap gap-2 -mx-2 px-2 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <FilterBracket
          active={filter === "all"}
          count={releases.length}
          onClick={() => setFilter("all")}
        >
          All
        </FilterBracket>
        {RELEASE_STATUS_ORDER.map((s) => {
          if (counts[s] === 0) return null;
          return (
            <FilterBracket
              key={s}
              active={filter === s}
              count={counts[s]}
              onClick={() => setFilter(s)}
            >
              {RELEASE_STATUS_LABEL[s]}
            </FilterBracket>
          );
        })}
      </div>

      {sorted.length === 0 ? (
        <p className="py-12 text-center font-sans text-[13px] text-fg-faint">
          No releases match.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5">
          {sorted.map((r) => (
            <li key={r.id}>
              <Link
                href={`/releases/${r.slug}`}
                className={cn(
                  "group block bg-surface border border-line",
                  "hover:border-line-strong hover:shadow-[0_8px_24px_rgba(26,22,18,0.08)]",
                  "[transition-property:border-color,box-shadow,transform] [transition-duration:120ms]",
                  "hover:-translate-y-0.5",
                )}
              >
                <Cover release={r} />
                <div className="p-3 md:p-4 flex flex-col gap-2">
                  <h3
                    className="font-display text-[14px] md:text-[15px] text-fg leading-[1.25] line-clamp-2"
                    style={{ fontWeight: 500, letterSpacing: "-0.005em" }}
                  >
                    {sentenceCase(r.title)}
                  </h3>
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusBracket tone={STATUS_TONE[r.status] ?? "default"}>
                      {RELEASE_STATUS_LABEL[r.status]}
                    </StatusBracket>
                    <span className="opacity-40 text-fg-faint">·</span>
                    <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint truncate">
                      {TYPE_LABEL[r.type]}
                    </span>
                  </div>
                  {r.collaborators?.length || r.release_date ? (
                    <div className="font-sans text-[12px] text-fg-dim truncate">
                      {r.collaborators?.length
                        ? `with ${r.collaborators.join(", ")}`
                        : r.release_date
                          ? r.status === "released"
                            ? formatYear(r.release_date)
                            : formatDateCompact(r.release_date)
                          : null}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Cover({ release }: { release: Release }) {
  const r = release;
  if (r.cover_art_url) {
    return (
      <div className="aspect-square overflow-hidden border-b border-line">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={r.cover_art_url}
          alt={`${r.title} cover art`}
          className="w-full h-full object-cover group-hover:scale-[1.02] [transition-duration:200ms]"
        />
      </div>
    );
  }
  // No cover art: status-tinted gradient block with the title as the
  // visual. Reads as a cover-art stand-in even for idea-stage tracks.
  return (
    <div
      className="aspect-square relative border-b border-line overflow-hidden flex items-end p-4"
      style={{ background: STATUS_GRADIENT[r.status] }}
    >
      <span
        className="font-display lowercase leading-[0.95] tracking-[-0.025em] line-clamp-3 break-words"
        style={{
          color: r.status === "released" ? "var(--color-fg-inverted)" : "var(--color-fg)",
          fontSize: "clamp(18px, 3.5vw, 28px)",
          fontWeight: 600,
          opacity: r.status === "released" ? 0.95 : 0.85,
        }}
      >
        {r.title.toLowerCase()}
      </span>
    </div>
  );
}
