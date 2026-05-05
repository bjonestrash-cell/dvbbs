"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NAV } from "./nav-config";
import { Logo } from "@/components/brand/logo";
import { useSidebar } from "./sidebar-state";
import { cn } from "@/lib/utils/cn";

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-dvh shrink-0 flex-col bg-surface border-r border-line",
          "transition-[width] [transition-duration:120ms] ease-out",
          collapsed ? "w-[60px]" : "w-[228px]",
        )}
        aria-label="Primary navigation"
      >
        <SidebarBody
          collapsed={collapsed}
          mobile={false}
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
          <aside className="relative z-10 w-[80%] max-w-[280px] h-dvh bg-surface border-r border-line flex flex-col">
            <SidebarBody
              collapsed={false}
              mobile
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
  onItemClick,
  onToggleCollapse,
  onClose,
}: {
  collapsed: boolean;
  mobile: boolean;
  onItemClick: (() => void) | undefined;
  onToggleCollapse: (() => void) | undefined;
  onClose: (() => void) | undefined;
}) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center",
          collapsed ? "justify-center h-16 px-0" : "justify-between h-16 px-5",
        )}
      >
        <Link
          href="/tour"
          onClick={onItemClick}
          className="text-fg"
          aria-label="DVBBS"
        >
          <Logo size="md" collapsed={collapsed} />
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="size-7 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-4" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto pt-2 pb-3">
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
                    "relative flex items-center",
                    "[transition-duration:80ms]",
                    collapsed && !mobile
                      ? "justify-center px-0 py-2.5"
                      : "gap-3 px-5 py-2.5",
                    active
                      ? "text-fg"
                      : "text-fg-dim hover:text-fg",
                  )}
                >
                  {active ? (
                    <span
                      aria-hidden
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-accent"
                    />
                  ) : null}
                  <Icon
                    aria-hidden
                    strokeWidth={1.5}
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-fg" : "text-fg-faint",
                    )}
                  />
                  {collapsed && !mobile ? null : (
                    <>
                      <span
                        className="flex-1 truncate font-display lowercase"
                        style={{
                          fontSize: 14,
                          fontWeight: active ? 600 : 500,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {item.label}
                      </span>
                      {!item.ready ? (
                        <span className="font-mono lowercase tracking-[0.18em] text-[9px] text-fg-faint">
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

      {!mobile ? (
        <div
          className={cn(
            "shrink-0",
            collapsed ? "px-0 py-3" : "px-5 py-3 flex justify-end",
          )}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "size-7 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]",
              collapsed ? "mx-auto" : "",
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      ) : null}
    </>
  );
}

