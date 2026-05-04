"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "./sidebar-state";

export function MobileMenuButton() {
  const { setMobileOpen } = useSidebar();
  return (
    <button
      type="button"
      onClick={() => setMobileOpen(true)}
      aria-label="Open navigation"
      className="md:hidden -ml-1 size-9 grid place-items-center text-fg hover:bg-surface-2 [transition-duration:80ms]"
    >
      <Menu className="size-5" aria-hidden />
    </button>
  );
}
