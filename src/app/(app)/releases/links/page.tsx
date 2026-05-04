import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { listSmartLinks } from "@/lib/data/smart-links";
import { formatDateCompact } from "@/lib/format";

export const metadata = { title: "Smart links. DVBBS HQ" };

export default async function SmartLinksPage() {
  const links = await listSmartLinks();

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title="Smart links"
        description="One slug per release, routes to the listener's preferred platform."
        actions={
          <Link
            href="/releases/links/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            + New link
          </Link>
        }
      />
      {links.length === 0 ? (
        <div className="px-6 md:px-10 py-10">
          <EmptyState
            title="No smart links yet."
            hint="Create one to start routing fans to the right platform."
            action={
              <Link
                href="/releases/links/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                + New link
              </Link>
            }
          />
        </div>
      ) : (
        <div className="px-6 md:px-10 py-8">
          <div className="border-y border-line">
            <div className="hidden sm:grid grid-cols-[1fr_1.5fr_120px_140px_120px] items-center gap-4 px-4 py-3 border-b border-line">
              <span className="label">Slug</span>
              <span className="label">Release</span>
              <span className="label text-right">Clicks</span>
              <span className="label text-right">Last clicked</span>
              <span className="label text-right">Action</span>
            </div>
            <ul>
              {links.map((l) => (
                <li
                  key={l.id}
                  className="grid grid-cols-[1fr_1.5fr_120px_140px_120px] items-center gap-4 px-4 py-5 border-b border-line hover:bg-surface-2 [transition-duration:80ms]"
                >
                  <span className="num font-mono text-[13px] text-fg">
                    /link/{l.slug}
                  </span>
                  <span className="font-sans text-[13px] text-fg-dim truncate">
                    {l.title ?? l.release_title ?? "—"}
                  </span>
                  <span className="display-stat text-fg text-right tabular text-[24px]">
                    {l.click_count}
                  </span>
                  <span className="num font-mono text-[11px] text-fg-faint text-right">
                    {formatDateCompact(l.created_at)}
                  </span>
                  <span className="text-right">
                    <Link
                      href={`/releases/links/${l.id}`}
                      className="inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim hover:text-fg [transition-duration:80ms]"
                    >
                      <span>Analytics</span>
                      <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
                    </Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
