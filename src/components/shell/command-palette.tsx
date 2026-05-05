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
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12dvh] px-4"
      onClick={() => setOpen(false)}
      onKeyDown={onListKey}
    >
      <div
        className="absolute inset-0 bg-inverted/40 backdrop-blur-[2px]"
        aria-hidden
      />
      <div
        role="dialog"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-lg border border-line bg-surface shadow-[0_24px_60px_rgba(26,22,18,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search className="size-4 text-fg-faint shrink-0" strokeWidth={1.5} aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Jump to show, contact, or page"
            className="h-12 w-full bg-transparent font-sans text-[15px] text-fg placeholder:text-fg-faint outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 border border-line px-1.5 py-0.5 font-mono text-[10px] tracking-[0.06em] uppercase text-fg-faint">
            esc
          </kbd>
        </div>

        <ul className="max-h-[60dvh] overflow-y-auto py-1">
          {hits.length === 0 ? (
            <li className="px-4 py-8 text-center font-sans text-[13px] text-fg-faint">
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
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left [transition-duration:80ms]",
                      i === active
                        ? "bg-surface-2 text-fg"
                        : "text-fg-dim hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <Icon
                      className="size-4 shrink-0 text-fg-faint"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-sans text-[14px]">
                        {h.title}
                      </span>
                      {h.subtitle ? (
                        <span className="block truncate font-sans text-[12px] text-fg-faint">
                          {h.subtitle}
                        </span>
                      ) : null}
                    </span>
                    <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                      {h.badge ?? KIND_LABEL[h.kind]}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>

        <div className="hidden sm:flex items-center justify-between border-t border-line px-4 py-2 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
          <span>
            <kbd className="mr-1.5 border border-line px-1 py-0.5">↑↓</kbd>
            navigate
            <kbd className="ml-4 mr-1.5 border border-line px-1 py-0.5">↵</kbd>
            open
          </span>
          <span>
            <kbd className="border border-line px-1 py-0.5">⌘K</kbd>
            <span className="ml-1.5">toggle</span>
          </span>
        </div>
      </div>
    </div>
  );
}
