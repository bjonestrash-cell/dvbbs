"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FlightStatus } from "@/lib/supabase/types";
import { FilterBracket } from "@/components/ui/status-bracket";
import {
  FLIGHT_STATUS_LABEL,
  FLIGHT_STATUS_ORDER,
} from "@/lib/data/flights-shared";

export function FlightFilters({
  counts,
  total,
}: {
  counts?: Partial<Record<FlightStatus, number>>;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selected = (sp.get("status")?.split(",").filter(Boolean) ??
    []) as FlightStatus[];
  const q = sp.get("q") ?? "";
  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  function update(next: URLSearchParams) {
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  }

  function toggleStatus(s: FlightStatus) {
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

  function clearAll() {
    update(new URLSearchParams());
  }

  const anyFilter = selected.length > 0 || q;

  return (
    <div className="flex flex-col gap-4 px-6 md:px-10 py-5 border-b border-line bg-page">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-faint"
            aria-hidden
            strokeWidth={1.5}
          />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setSearch(searchText);
            }}
            onBlur={() => setSearch(searchText)}
            placeholder="Search airline, route, code"
            className="h-10 w-full border border-line bg-surface pl-10 pr-3 font-sans text-[14px] placeholder:text-fg-faint outline-none focus:border-line-strong"
          />
        </div>
        <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
          {total} total
        </span>
        {anyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-9 inline-flex items-center gap-1 px-3 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-dim hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-3" strokeWidth={1.5} aria-hidden />
            Clear
          </button>
        ) : null}
      </div>

      <div className="flex flex-nowrap sm:flex-wrap gap-2 -mx-2 px-2 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {FLIGHT_STATUS_ORDER.map((s) => (
          <FilterBracket
            key={s}
            active={selected.includes(s)}
            count={counts?.[s] ?? null}
            onClick={() => toggleStatus(s)}
          >
            {FLIGHT_STATUS_LABEL[s]}
          </FilterBracket>
        ))}
      </div>
    </div>
  );
}
