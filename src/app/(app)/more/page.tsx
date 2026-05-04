import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { NAV } from "@/components/shell/nav-config";

export const metadata = { title: "More. DVBBS HQ" };

export default function MorePage() {
  const items = NAV.filter((n) => !n.mobile);
  return (
    <>
      <PageHeader eyebrow="more" title="Other surfaces" />
      <ul className="divide-y divide-line border-y border-line bg-bg-surface md:hidden">
        {items.map((n) => {
          const Icon = n.icon;
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className="flex items-center justify-between px-4 py-3.5 text-sm transition-colors active:bg-bg-elev"
              >
                <span className="flex items-center gap-3">
                  <Icon className="size-4 text-fg-muted" aria-hidden />
                  <span>{n.label}</span>
                  {!n.ready ? (
                    <span className="marker text-[9px]">P{n.phase}</span>
                  ) : null}
                </span>
                <ChevronRight className="size-4 text-fg-dim" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="hidden md:block px-4 md:px-6 py-6 text-sm text-fg-muted">
        On desktop, use the sidebar.
      </div>
    </>
  );
}
