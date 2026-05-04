"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export function CopySmartLinkButton({
  slug,
  className,
}: {
  slug: string | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!slug) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-faint",
          className,
        )}
      >
        No smart link
      </span>
    );
  }

  function copy() {
    if (typeof window === "undefined") return;
    const url = `${window.location.origin}/link/${slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => {
        // ignore
      });
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.06em] text-[11px] [transition-duration:80ms]",
        copied ? "text-confirmed" : "text-fg-dim hover:text-fg",
        className,
      )}
    >
      <span>{copied ? "Copied" : "Copy smart link"}</span>
      <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
    </button>
  );
}
