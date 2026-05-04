"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NAV } from "./nav-config";
import { Logo } from "@/components/brand/logo";
import { useSidebar } from "./sidebar-state";
import { cn } from "@/lib/utils/cn";

export function Sidebar({ commitSha }: { commitSha?: string }) {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-dvh shrink-0 flex-col bg-surface border-r border-line",
          "transition-[width] [transition-duration:120ms] ease-out",
          collapsed ? "w-16" : "w-[260px]",
        )}
        aria-label="Primary navigation"
      >
        <SidebarBody
          collapsed={collapsed}
          mobile={false}
          commitSha={commitSha}
          onItemClick={undefined}
          onToggleCollapse={toggleCollapsed}
          onClose={undefined}
        />
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-50 flex md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
        >
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-inverted/30"
          />
          <aside className="relative z-10 w-[80%] max-w-[300px] h-dvh bg-surface border-r border-line flex flex-col">
            <SidebarBody
              collapsed={false}
              mobile
              commitSha={commitSha}
              onItemClick={() => setMobileOpen(false)}
              onToggleCollapse={undefined}
              onClose={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      ) : null}
    </>
  );
}

function SidebarBody({
  collapsed,
  mobile,
  commitSha,
  onItemClick,
  onToggleCollapse,
  onClose,
}: {
  collapsed: boolean;
  mobile: boolean;
  commitSha: string | undefined;
  onItemClick: (() => void) | undefined;
  onToggleCollapse: (() => void) | undefined;
  onClose: (() => void) | undefined;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-line",
          collapsed ? "justify-center px-0 py-6" : "justify-between px-6 py-6",
        )}
      >
        <Link
          href="/tour"
          onClick={onItemClick}
          className="text-fg"
          aria-label="DVBBS HQ home"
        >
          <Logo size="md" collapsed={collapsed} />
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="size-8 grid place-items-center text-fg-dim hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto py-3">
        <ul className="flex flex-col">
          {NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onItemClick}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center font-sans text-[13px]",
                    "[transition-duration:80ms]",
                    collapsed && !mobile
                      ? "justify-center px-0 py-3"
                      : "gap-3 px-6 py-3",
                    active
                      ? "bg-inverted text-fg-inverted"
                      : "text-fg-dim hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <Icon
                    aria-hidden
                    strokeWidth={1.5}
                    className="size-4 shrink-0"
                  />
                  {collapsed && !mobile ? null : (
                    <>
                      <span className="flex-1 truncate">{toLabel(item.label)}</span>
                      {!item.ready ? (
                        <span
                          className={cn(
                            "font-mono lowercase tracking-[0.2em] text-[9px]",
                            active ? "opacity-60" : "text-fg-faint",
                          )}
                        >
                          soon
                        </span>
                      ) : null}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-line",
          collapsed && !mobile ? "px-0 py-3" : "px-6 py-3",
        )}
      >
        {collapsed && !mobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="w-full h-8 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]"
          >
            <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.14em] text-fg-faint lowercase">
              build {(commitSha ?? "local").toLowerCase()}
            </span>
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className="size-8 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]"
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}

/** Convert "TOUR" / "RELEASES" labels stored in nav-config to sentence case. */
function toLabel(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
