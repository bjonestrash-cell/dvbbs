"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DESKTOP_NAV } from "./nav-config";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-dvh w-56 shrink-0 flex-col border-r border-line bg-bg-surface">
      <div className="flex h-14 items-center gap-2 border-b border-line px-4">
        <ChevronMark className="size-5 text-accent" />
        <div className="font-display text-sm tracking-tight">
          <span className="font-semibold">DVBBS</span>
          <span className="text-fg-muted"> HQ</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <ul className="flex flex-col gap-0.5">
          {DESKTOP_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-bg-elev text-fg"
                      : "text-fg-muted hover:bg-bg-elev hover:text-fg",
                    !item.ready && "opacity-60",
                  )}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "size-4",
                        active ? "text-accent" : "text-fg-muted group-hover:text-fg",
                      )}
                      aria-hidden
                    />
                    {item.label}
                  </span>
                  {!item.ready ? (
                    <span className="marker text-[9px]">P{item.phase}</span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-line p-3 text-[10px] tracking-wide text-fg-dim uppercase">
        v0.1.0
      </div>
    </aside>
  );
}

function ChevronMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M3 6L12 15L21 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <path d="M3 14L12 23L21 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}
