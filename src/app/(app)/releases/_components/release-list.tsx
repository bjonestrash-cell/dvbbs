"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Disc3 } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/release-shared";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
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

function sentenceCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

type Group = { status: ReleaseStatus; items: Release[] };

export function ReleaseList({ releases }: { releases: Release[] }) {
  const groups: Group[] = useMemo(() => {
    const out: Group[] = [];
    for (const status of RELEASE_STATUS_ORDER) {
      const items = releases.filter((r) => r.status === status);
      if (items.length === 0) continue;
      // Sort within group: titles alphabetical, but released items by date desc.
      const sorted =
        status === "released"
          ? [...items].sort((a, b) =>
              (b.release_date ?? "").localeCompare(a.release_date ?? ""),
            )
          : [...items].sort((a, b) => a.title.localeCompare(b.title));
      out.push({ status, items: sorted });
    }
    return out;
  }, [releases]);

  // Collapse state per status. Default: everything open.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (s: string) =>
    setCollapsed((prev) => ({ ...prev, [s]: !prev[s] }));

  return (
    <div className="px-6 md:px-10 py-6 flex flex-col gap-8">
      {groups.map(({ status, items }) => {
        const isCollapsed = collapsed[status] ?? false;
        return (
          <section key={status}>
            <button
              type="button"
              onClick={() => toggle(status)}
              className="w-full flex items-baseline gap-2 pb-3 group"
            >
              {isCollapsed ? (
                <ChevronRight
                  className="size-4 text-fg-faint group-hover:text-fg-dim translate-y-[2px]"
                  strokeWidth={1.5}
                  aria-hidden
                />
              ) : (
                <ChevronDown
                  className="size-4 text-fg-faint group-hover:text-fg-dim translate-y-[2px]"
                  strokeWidth={1.5}
                  aria-hidden
                />
              )}
              <h2
                className="font-display text-[18px] text-fg"
                style={{ fontWeight: 500 }}
              >
                {RELEASE_STATUS_LABEL[status]}
              </h2>
              <span className="opacity-50 font-mono text-[11px]">·</span>
              <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
                {items.length.toString().padStart(2, "0")}
              </span>
            </button>

            {isCollapsed ? null : (
              <ul className="border-y border-line">
                {items.map((r, i) => (
                  <li key={r.id}>
                    <Link
                      href={`/releases/${r.slug}`}
                      className={cn(
                        "grid grid-cols-[40px_minmax(0,1fr)_auto] sm:grid-cols-[40px_minmax(0,2fr)_minmax(0,1fr)_80px_100px_80px] items-center gap-3 sm:gap-4 px-2 sm:px-3 py-2.5 hover:bg-surface-2 [transition-duration:80ms]",
                        i > 0 ? "border-t border-line" : "",
                      )}
                    >
                      <Cover url={r.cover_art_url} title={r.title} />
                      <div className="min-w-0">
                        <span className="block truncate font-sans text-[14px] text-fg">
                          {sentenceCase(r.title)}
                        </span>
                        <span className="sm:hidden mt-0.5 block flex flex-wrap gap-x-3 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                          <span>{TYPE_LABEL[r.type]}</span>
                          {r.collaborators?.length ? (
                            <span className="normal-case tracking-normal font-sans text-fg-dim truncate">
                              with {r.collaborators.join(", ")}
                            </span>
                          ) : null}
                        </span>
                      </div>
                      <span className="hidden sm:block min-w-0 truncate font-sans text-[13px] text-fg-dim">
                        {r.collaborators?.length
                          ? `with ${r.collaborators.join(", ")}`
                          : "—"}
                      </span>
                      <span className="hidden sm:inline font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                        {TYPE_LABEL[r.type]}
                      </span>
                      <span className="hidden sm:inline num font-mono text-[11px] text-fg-faint">
                        {r.release_date
                          ? r.status === "released"
                            ? formatYear(r.release_date)
                            : formatDateCompact(r.release_date)
                          : "—"}
                      </span>
                      <span className="flex items-center justify-end shrink-0">
                        <StatusBracket tone={STATUS_TONE[r.status] ?? "default"}>
                          <span className="hidden sm:inline">
                            {RELEASE_STATUS_LABEL[r.status]}
                          </span>
                          <span className="sm:hidden">
                            {RELEASE_STATUS_LABEL[r.status].slice(0, 4)}
                          </span>
                        </StatusBracket>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Cover({ url, title }: { url: string | null; title: string }) {
  if (!url) {
    return (
      <div className="size-10 grid place-items-center bg-surface-2 border border-line shrink-0">
        <Disc3
          className="size-4 text-fg-faint"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-10 object-cover border border-line shrink-0"
    />
  );
}
