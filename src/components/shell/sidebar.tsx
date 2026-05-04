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
      {/* Desktop sidebar, fixed-width column. Collapses to 56px. */}
      <aside
        className={cn(
          "hidden md:flex h-dvh shrink-0 flex-col border-r border-line bg-page",
          "transition-[width] [transition-duration:120ms] ease-out",
          collapsed ? "w-14" : "w-60",
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

      {/* Mobile drawer, full-screen overlay. */}
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
            className="absolute inset-0 bg-page/80"
          />
          <aside className="relative z-10 w-[78%] max-w-72 h-dvh bg-page border-r border-line flex flex-col">
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
          "flex h-14 shrink-0 items-center border-b border-line",
          collapsed ? "justify-center px-0" : "justify-between px-4",
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
            className="size-8 grid place-items-center text-fg-dim hover:text-fg"
          >
            <X className="size-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
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
                    "relative flex h-10 items-center font-mono uppercase tracking-[0.08em] text-[12px]",
                    "[transition-duration:80ms]",
                    collapsed && !mobile ? "justify-center px-0" : "px-4",
                    active
                      ? "bg-fg text-page"
                      : "text-fg-dim hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-0 bottom-0 w-px bg-accent"
                    />
                  ) : null}
                  <Icon
                    aria-hidden
                    className={cn(
                      "size-4 shrink-0",
                      collapsed && !mobile ? "" : "mr-3",
                    )}
                  />
                  {collapsed && !mobile ? null : (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!item.ready && !(collapsed && !mobile) ? (
                    <span
                      className={cn(
                        "ml-2 bracket-text",
                        active ? "opacity-50" : "text-fg-faint",
                      )}
                    >
                      <span className="opacity-60">[</span>SOON
                      <span className="opacity-60">]</span>
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div
        className={cn(
          "shrink-0 border-t border-line",
          collapsed && !mobile ? "px-0 py-2" : "px-4 py-2",
        )}
      >
        {collapsed && !mobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            className="w-full h-8 grid place-items-center text-fg-dim hover:text-fg"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        ) : (
          <div className="flex items-center justify-between">
            <span className="bracket-text text-fg-faint">
              <span className="opacity-60">[</span>
              {commitSha ?? "LOCAL"}
              <span className="opacity-60">]</span>
            </span>
            {onToggleCollapse ? (
              <button
                type="button"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
                className="size-8 grid place-items-center text-fg-dim hover:text-fg"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
