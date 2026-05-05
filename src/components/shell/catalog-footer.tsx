"use client";

import { usePathname } from "next/navigation";

export function CatalogFooter({ commitSha }: { commitSha: string }) {
  const pathname = usePathname();
  return (
    <footer className="px-6 md:px-10 py-5 md:py-6 border-t border-line">
      <p className="font-mono text-[10px] tracking-[0.14em] text-fg-faint lowercase truncate">
        dvbbs hq
        <span className="opacity-50 mx-1.5">·</span>
        <span className="num">{pathname || "/"}</span>
        <span className="opacity-50 mx-1.5">·</span>
        build {commitSha.toLowerCase()}
      </p>
    </footer>
  );
}
