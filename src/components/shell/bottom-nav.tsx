"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { NAV } from "./nav-config";
import { useSidebar } from "./sidebar-state";
import { cn } from "@/lib/utils/cn";

/**
 * Mobile bottom tab bar. Five slots: the four primary destinations plus
 * a "More" tab that opens the full navigation drawer.
 *
 * Tour and Releases are the wedge surfaces, Merch and Contacts round out
 * the daily-use set. Inbox / Finance / Team / Settings live behind More.
 */
const PRIMARY_HREFS = ["/tour", "/releases", "/merch", "/contacts"] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { setMobileOpen, mobileOpen } = useSidebar();

  const primary = PRIMARY_HREFS.map((href) => {
    const item = NAV.find((n) => n.href === href);
    if (!item) return null;
    return item;
  }).filter((x): x is NonNullable<typeof x> => Boolean(x));

  // Active state for "More": when the route is one of the secondary nav
  // items (anything not in primary).
  const moreActive =
    !primary.some(
      (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
    ) && pathname !== "/";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 inset-x-0 z-30 md:hidden",
        "border-t border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/85",
        "pb-safe",
      )}
    >
      <ul className="grid grid-cols-5">
        {primary.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 [transition-duration:80ms]",
                  active ? "text-fg" : "text-fg-faint hover:text-fg",
                )}
              >
                <Icon
                  className={cn(
                    "size-5",
                    active ? "text-fg" : "text-fg-faint",
                  )}
                  strokeWidth={1.5}
                  aria-hidden
                />
                <span
                  className="font-display lowercase tracking-[-0.01em]"
                  style={{
                    fontSize: 10,
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {item.label.toLowerCase()}
                </span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="More navigation"
            aria-expanded={mobileOpen}
            className={cn(
              "flex h-14 w-full flex-col items-center justify-center gap-1 [transition-duration:80ms]",
              moreActive ? "text-fg" : "text-fg-faint hover:text-fg",
            )}
          >
            <MoreHorizontal
              className={cn(
                "size-5",
                moreActive ? "text-fg" : "text-fg-faint",
              )}
              strokeWidth={1.5}
              aria-hidden
            />
            <span
              className="font-display lowercase tracking-[-0.01em]"
              style={{
                fontSize: 10,
                fontWeight: moreActive ? 600 : 500,
              }}
            >
              more
            </span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
