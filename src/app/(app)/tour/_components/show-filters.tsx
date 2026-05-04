"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ShowStatus } from "@/lib/supabase/types";
import { FilterBracket } from "@/components/ui/status-bracket";

const STATUSES: { value: ShowStatus; label: string }[] = [
  { value: "lead", label: "LEAD" },
  { value: "offered", label: "OFFERED" },
  { value: "holding", label: "HOLDING" },
  { value: "confirmed", label: "CONFIRMED" },
  { value: "contracted", label: "CONTRACTED" },
  { value: "completed", label: "COMPLETED" },
  { value: "cancelled", label: "CANCELLED" },
];

export function ShowFilters({
  counts,
}: {
  counts?: Partial<Record<ShowStatus, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selected = (sp.get("status")?.split(",").filter(Boolean) ??
    []) as ShowStatus[];
  const q = sp.get("q") ?? "";
  const from = sp.get("from") ?? "";
  const to = sp.get("to") ?? "";

  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  function update(next: URLSearchParams) {
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  }

  function toggleStatus(s: ShowStatus) {
    const set = new Set(selected);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    const next = new URLSearchParams(sp);
    if (set.size === 0) next.delete("status");
    else next.set("status", Array.from(set).join(","));
    update(next);
  }

  function setSearch(value: string) {
    const next = new URLSearchParams(sp);
    if (value) next.set("q", value);
    else next.delete("q");
    update(next);
  }

  function setRange(field: "from" | "to", value: string) {
    const next = new URLSearchParams(sp);
    if (value) next.set(field, value);
    else next.delete(field);
    update(next);
  }

  function clearAll() {
    update(new URLSearchParams());
  }

  const anyFilter = selected.length > 0 || q || from || to;

  return (
    <div className="flex flex-col gap-2 px-4 md:px-6 py-3 border-b border-line bg-page">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search
            className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-faint"
            aria-hidden
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchText);
            }}
            onBlur={() => setSearch(searchText)}
            placeholder="SEARCH CITY OR VENUE"
            className="h-8 w-full border border-line bg-surface pl-8 pr-2 font-mono uppercase tracking-[0.08em] text-[11px] placeholder:text-fg-faint outline-none focus:border-line-strong"
          />
        </div>

        <input
          type="date"
          value={from}
          onChange={(e) => setRange("from", e.target.value)}
          className="h-8 border border-line bg-surface px-2 font-mono text-[11px] text-fg outline-none focus:border-line-strong num"
          aria-label="From date"
        />
        <span className="text-fg-faint text-[10px] uppercase tracking-[0.12em]">
          TO
        </span>
        <input
          type="date"
          value={to}
          onChange={(e) => setRange("to", e.target.value)}
          className="h-8 border border-line bg-surface px-2 font-mono text-[11px] text-fg outline-none focus:border-line-strong num"
          aria-label="To date"
        />

        {anyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-8 inline-flex items-center gap-1 px-2 font-mono uppercase tracking-[0.08em] text-[10px] text-fg-dim hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-3" aria-hidden />
            CLEAR
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1 -mx-1 px-1 overflow-x-auto sm:overflow-visible sm:flex-wrap">
        {STATUSES.map((s) => (
          <FilterBracket
            key={s.value}
            active={selected.includes(s.value)}
            count={counts?.[s.value] ?? null}
            onClick={() => toggleStatus(s.value)}
          >
            {s.label}
          </FilterBracket>
        ))}
      </div>
    </div>
  );
}
