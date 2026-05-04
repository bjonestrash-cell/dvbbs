"use client";

import { useState } from "react";
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
          "bracket-text font-mono h-7 inline-flex items-center px-2 border border-line text-fg-faint opacity-60",
          className,
        )}
      >
        <span className="opacity-60">[</span>NO SMART LINK<span className="opacity-60">]</span>
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
        "bracket-text font-mono h-7 inline-flex items-center px-2 border [transition-duration:80ms]",
        copied
          ? "bg-confirmed text-page border-confirmed"
          : "border-line text-fg hover:border-line-strong hover:bg-surface-2",
        className,
      )}
    >
      <span className="opacity-60">[ </span>
      {copied ? "COPIED" : "COPY SMART LINK"}
      <span className="opacity-60"> ]</span>
    </button>
  );
}
