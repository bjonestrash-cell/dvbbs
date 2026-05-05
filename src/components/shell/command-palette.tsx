"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Disc3, Search, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Hit = {
  kind: "show" | "contact" | "nav";
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
};

const KIND_ICON = {
  show: Calendar,
  contact: Users,
  nav: ArrowRight,
} as const;

const KIND_LABEL = {
  show: "Show",
  contact: "Contact",
  nav: "Navigate",
} as const;

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
    else {
      setQ("");
      setHits([]);
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(
          `/api/search?q=${encodeURIComponent(q)}`,
          { signal: ctrl.signal },
        );
        if (r.ok) {
          const j = await r.json();
          setHits(j.hits ?? []);
          setActive(0);
        }
      } catch {
        // aborted
      } finally {
        setLoading(false);
      }
    }, q ? 120 : 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q, open]);

  function go(hit: Hit) {
    setOpen(false);
    router.push(hit.href);
  }

  function onListKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[active]) go(hits[active]);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4"
      onClick={() => setOpen(false)}
      onKeyDown={onListKey}
    >
      <div
        className="absolute inset-0 bg-page/60 backdrop-blur-sm"
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg border border-line-strong bg-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="size-4 text-fg-dim" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to show, contact, or page..."
            className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-dim outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-line px-1.5 py-0.5 text-[10px] text-fg-dim">
            esc
          </kbd>
        </div>

        <ul className="max-h-[60vh] overflow-y-auto p-1">
          {hits.length === 0 ? (
            <li className="px-3 py-6 text-sm text-fg-dim text-center">
              {loading ? "Searching" : "No matches."}
            </li>
          ) : (
            hits.map((h, i) => {
              const Icon = KIND_ICON[h.kind] ?? Disc3;
              return (
                <li key={`${h.kind}-${h.id}`}>
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(h)}
                    className={cn(
                      "flex w-full items-center gap-3 px-2 py-2 text-left [transition-duration:80ms]",
                      i === active
                        ? "bg-surface-2 text-fg"
                        : "text-fg-dim hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm">{h.title}</span>
                      {h.subtitle ? (
                        <span className="block truncate text-[11px] text-fg-dim">
                          {h.subtitle}
                        </span>
                      ) : null}
                    </span>
                    <span className="marker text-fg-dim">
                      {h.badge ?? KIND_LABEL[h.kind]}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="flex items-center justify-between border-t border-line px-3 py-1.5 text-[10px] text-fg-dim">
          <span>
            <kbd className="mr-1 rounded border border-line px-1">↑↓</kbd>
            navigate
            <kbd className="ml-3 mr-1 rounded border border-line px-1">↵</kbd>
            open
          </span>
          <span>
            <kbd className="rounded border border-line px-1">⌘K</kbd> toggle
          </span>
        </div>
      </div>
    </div>
  );
}
