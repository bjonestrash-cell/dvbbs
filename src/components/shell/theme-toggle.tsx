"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * Light/dark theme toggle. State lives in localStorage ("dvbbs.theme") and
 * is applied as `data-theme` on the <html> root. The token swap in
 * globals.css does the rest of the work — no per-component dark logic.
 *
 * The initial paint reads from a small inline script in layout.tsx so we
 * never get a flash of light theme on a dark-preferring viewer.
 */

type Theme = "light" | "dark";

function readStoredTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.getAttribute("data-theme");
  if (attr === "dark") return "dark";
  return "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("dvbbs.theme", theme);
  } catch {
    // ignore
  }
}

export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "labeled";
  className?: string;
}) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readStoredTheme());
    setMounted(true);
  }, []);

  function flip() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  }

  // Render a placeholder shape until mount so SSR + initial paint don't
  // flash the wrong icon.
  const Icon = mounted ? (theme === "dark" ? Sun : Moon) : Moon;
  const label =
    mounted && theme === "dark" ? "Switch to light" : "Switch to dark";

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={flip}
        aria-label={label}
        className={cn(
          "inline-flex items-center gap-2 font-mono lowercase tracking-[0.06em] text-[12px] text-fg-dim hover:text-fg [transition-duration:80ms]",
          className,
        )}
      >
        <Icon className="size-4" strokeWidth={1.5} aria-hidden />
        <span>{mounted && theme === "dark" ? "light mode" : "dark mode"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={flip}
      aria-label={label}
      title={label}
      className={cn(
        "size-7 grid place-items-center text-fg-faint hover:text-fg [transition-duration:80ms]",
        className,
      )}
    >
      <Icon className="size-4" strokeWidth={1.5} aria-hidden />
    </button>
  );
}
