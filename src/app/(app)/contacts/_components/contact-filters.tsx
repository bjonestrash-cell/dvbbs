"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { FilterBracket } from "@/components/ui/status-bracket";
import {
  CONTACT_TYPE_LABEL,
  CONTACT_TYPE_ORDER,
} from "@/lib/data/contacts-shared";
import type { ContactType } from "@/lib/supabase/types";

export function ContactFilters({
  counts,
}: {
  counts?: Partial<Record<ContactType, number>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const type = (sp.get("type") as ContactType | null) ?? "";
  const q = sp.get("q") ?? "";
  const [searchText, setSearchText] = useState(q);

  useEffect(() => {
    setSearchText(q);
  }, [q]);

  function update(next: URLSearchParams) {
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`, { scroll: false });
  }

  function setType(t: ContactType | "") {
    const next = new URLSearchParams(sp);
    if (t) next.set("type", t);
    else next.delete("type");
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

  const anyFilter = type || q;

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
            placeholder="Search name, company, email, city"
            className="h-10 w-full border border-line bg-surface pl-10 pr-3 font-sans text-[14px] placeholder:text-fg-faint outline-none focus:border-line-strong"
          />
        </div>
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
        <FilterBracket active={!type} onClick={() => setType("")}>
          All
        </FilterBracket>
        {CONTACT_TYPE_ORDER.map((t) => (
          <FilterBracket
            key={t}
            active={type === t}
            count={counts?.[t] ?? null}
            onClick={() => setType(t)}
          >
            {CONTACT_TYPE_LABEL[t]}
          </FilterBracket>
        ))}
      </div>
    </div>
  );
}
