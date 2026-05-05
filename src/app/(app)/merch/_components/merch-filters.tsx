"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FilterBracket } from "@/components/ui/status-bracket";
import { MERCH_STATUS_LABEL, MERCH_STATUS_ORDER } from "@/lib/data/merch-shared";
import type { MerchStatus } from "@/lib/supabase/types";

export function MerchFilters({
  categories,
  counts,
}: {
  categories: string[];
  counts?: Partial<Record<MerchStatus, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const status = (sp.get("status")?.split(",").filter(Boolean) ??
    []) as MerchStatus[];
  const category = sp.get("category") ?? "";
  const tourOnly = sp.get("tour") === "1";
  const q = sp.get("q") ?? "";
  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  function update(next: URLSearchParams) {
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  }

  function toggleStatus(s: MerchStatus) {
    const set = new Set(status);
    if (set.has(s)) set.delete(s);
    else set.add(s);
    const next = new URLSearchParams(sp);
    if (set.size === 0) next.delete("status");
    else next.set("status", Array.from(set).join(","));
    update(next);
  }

  function setCategory(c: string) {
    const next = new URLSearchParams(sp);
    if (c) next.set("category", c);
    else next.delete("category");
    update(next);
  }

  function toggleTourOnly() {
    const next = new URLSearchParams(sp);
    if (tourOnly) next.delete("tour");
    else next.set("tour", "1");
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

  const anyFilter = status.length > 0 || category || tourOnly || q;

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
            placeholder="Search name, sku, category"
            className="h-10 w-full border border-line bg-surface pl-10 pr-3 font-sans text-[14px] placeholder:text-fg-faint outline-none focus:border-line-strong"
          />
        </div>
        {categories.length > 0 ? (
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 border border-line bg-surface px-3 font-sans text-[13px] text-fg outline-none focus:border-line-strong"
            aria-label="Category"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        ) : null}
        <FilterBracket active={tourOnly} onClick={toggleTourOnly}>
          Tour exclusive
        </FilterBracket>
        {anyFilter ? (
          <button
            type="button"
            onClick={clearAll}
            className="h-10 inline-flex items-center gap-1 px-3 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-dim hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-3" strokeWidth={1.5} aria-hidden />
            Clear
          </button>
        ) : null}
      </div>
      <div className="flex flex-nowrap sm:flex-wrap gap-2 -mx-2 px-2 overflow-x-auto sm:overflow-visible">
        {MERCH_STATUS_ORDER.map((s) => (
          <FilterBracket
            key={s}
            active={status.includes(s)}
            count={counts?.[s] ?? null}
            onClick={() => toggleStatus(s)}
          >
            {MERCH_STATUS_LABEL[s]}
          </FilterBracket>
        ))}
      </div>
    </div>
  );
}
