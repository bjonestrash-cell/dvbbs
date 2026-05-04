"use client";

import { useState, useRef, useEffect } from "react";
import { LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { signOut } from "@/lib/auth/actions";
import type { AppRole } from "@/lib/supabase/types";

export function UserMenu({
  email,
  displayName,
  role,
}: {
  email: string;
  displayName: string | null;
  role: AppRole;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const initials = (displayName ?? email)
    .split(/[\s.@]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 rounded-md border border-line bg-bg-surface px-2 py-1 text-sm transition-colors hover:border-line-strong",
          open && "border-line-strong",
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="grid size-6 place-items-center rounded-sm bg-bg-elev text-[11px] font-medium text-fg-muted">
          {initials || <UserIcon className="size-3.5" aria-hidden />}
        </span>
        <span className="hidden sm:inline text-fg-muted truncate max-w-[180px]">
          {displayName ?? email}
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 rounded-md border border-line bg-bg-surface shadow-2xl z-40"
        >
          <div className="border-b border-line px-3 py-2.5">
            <div className="text-sm text-fg truncate">
              {displayName ?? email}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-muted">
              <span className="truncate">{email}</span>
              <span className="text-fg-dim">,</span>
              <span className="marker">{role}</span>
            </div>
          </div>
          <form action={signOut} className="p-1">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-fg-muted transition-colors hover:bg-bg-elev hover:text-fg"
            >
              <LogOut className="size-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
