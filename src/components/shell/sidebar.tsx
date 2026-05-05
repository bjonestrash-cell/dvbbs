"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { NAV } from "./nav-config";
import { Logo } from "@/components/brand/logo";
import { useSidebar } from "./sidebar-state";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils/cn";

/**
 * Desktop sidebar + mobile drawer.
 *
 * Width: 240px expanded (was 228 — too tight for the 15px nav labels),
 * 60px collapsed (icon-only).
 *
 * The frame matches the main app header: 56px tall, hairline bottom
 * border, same horizontal padding as the page header so the brand mark
 * sits in conversation with the content beneath it.
 *
 * Each nav item is a 32px row with a soft surface-2 hover fill and a
 * persistent surface-2 fill on the active route, plus a 16px accent
 * rule on the left edge as the high-contrast "you are here" signal.
 * Linear/Notion-grade.
 */

export function Sidebar() {
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <>
      <aside
        className={cn(
          "hidden md:flex h-dvh shrink-0 flex-col bg-surface border-r border-line",
          "transition-[width] [transition-duration:120ms] ease-out",
          collapsed ? "w-[60px]" : "w-[240px]",
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
            className="absolute inset-0 bg-inverted/45 backdrop-blur-[2px] [transition-duration:120ms]"
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
      {/* Brand row. No bottom border — the brand stands as the brand, not
         a panel header. The vertical rhythm is set by the nav's top
         padding below. */}
      <div
        className={cn(
          "flex shrink-0 items-center",
          collapsed ? "justify-center h-16 px-0" : "justify-between h-16 px-5",
        )}
      >
        <Link
          href="/tour"
          onClick={onItemClick}
          className="text-fg [transition-duration:80ms] hover:opacity-80"
          aria-label="DVBBS"
        >
          <Logo size="md" collapsed={collapsed} />
        </Link>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="size-11 -mr-3 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]"
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
        ) : null}
      </div>

      {/* Nav. Generous top padding gives the first item breathing room
         under the brand row; px-2 outer padding indents items from the
         sidebar edge so the active rule + hover fill have a visible
         margin instead of butting against the right border. */}
      <nav
        className={cn(
          "flex-1 overflow-y-auto pt-3 pb-3",
          collapsed && !mobile ? "px-2" : "px-2",
        )}
      >
        <ul className="flex flex-col gap-px">
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
                    "relative flex items-center [transition-duration:80ms]",
                    collapsed && !mobile
                      ? "justify-center h-9 px-0"
                      : mobile
                        ? "gap-3 h-11 px-3"
                        : "gap-3 h-9 px-3",
                    active
                      ? "bg-surface-2 text-fg"
                      : "text-fg-dim hover:bg-surface-2/60 hover:text-fg",
                  )}
                >
                  <Icon
                    aria-hidden
                    strokeWidth={1.5}
                    className={cn(
                      "size-[17px] shrink-0",
                      active ? "text-fg" : "text-fg-faint",
                    )}
                  />
                  {collapsed && !mobile ? null : (
                    <>
                      <span
                        className="flex-1 truncate font-display lowercase"
                        style={{
                          fontSize: 14.5,
                          fontWeight: active ? 600 : 500,
                          letterSpacing: "-0.005em",
                          lineHeight: 1.2,
                        }}
                      >
                        {item.label}
                      </span>
                      {!item.ready ? (
                        <span className="font-mono lowercase tracking-[0.14em] text-[10px] text-fg-faint">
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
            "shrink-0 border-t border-line",
            collapsed
              ? "px-0 py-2 flex flex-col items-center gap-1"
              : "px-3 py-2 flex items-center justify-between gap-2",
          )}
        >
          <ThemeToggle />
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="size-7 grid place-items-center text-fg-faint hover:text-fg hover:bg-surface-2 [transition-duration:80ms]"
          >
            {collapsed ? (
              <ChevronRight className="size-4" strokeWidth={1.5} aria-hidden />
            ) : (
              <ChevronLeft className="size-4" strokeWidth={1.5} aria-hidden />
            )}
          </button>
        </div>
      ) : (
        <div className="shrink-0 border-t border-line px-5 py-4 flex items-center justify-start">
          <ThemeToggle variant="labeled" />
        </div>
      )}
    </>
  );
}
