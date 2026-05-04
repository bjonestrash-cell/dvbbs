"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { ShowStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const STATUSES: { value: ShowStatus; label: string }[] = [
  { value: "lead", label: "Lead" },
  { value: "offered", label: "Offered" },
  { value: "holding", label: "Holding" },
  { value: "confirmed", label: "Confirmed" },
  { value: "contracted", label: "Contracted" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export function ShowFilters() {
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
    <div className="flex flex-col gap-2 px-4 md:px-6 py-3 border-b border-line bg-bg-base">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-fg-dim" aria-hidden />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchText);
            }}
            onBlur={() => setSearch(searchText)}
            placeholder="Search city or venue"
            className="h-8 w-full rounded-md border border-line bg-bg-input pl-8 pr-2 text-sm placeholder:text-fg-dim outline-none focus:border-line-strong"
          />
        </div>

        <input
          type="date"
          value={from}
          onChange={(e) => setRange("from", e.target.value)}
          className="h-8 rounded-md border border-line bg-bg-input px-2 text-sm text-fg outline-none focus:border-line-strong num"
          aria-label="From date"
        />
        <span className="text-fg-dim text-xs">to</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setRange("to", e.target.value)}
          className="h-8 rounded-md border border-line bg-bg-input px-2 text-sm text-fg outline-none focus:border-line-strong num"
          aria-label="To date"
        />

        {anyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-8 inline-flex items-center gap-1 rounded-md px-2 text-xs text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
          >
            <X className="size-3" aria-hidden />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1">
        {STATUSES.map((s) => {
          const active = selected.includes(s.value);
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => toggleStatus(s.value)}
              className={cn(
                "h-7 rounded-sm border px-2 text-[11px] font-medium uppercase tracking-wide transition-colors",
                active
                  ? "border-line-strong bg-bg-elev text-fg"
                  : "border-line text-fg-muted hover:border-line-strong hover:text-fg",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
