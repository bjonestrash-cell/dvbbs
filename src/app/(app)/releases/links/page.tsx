import Link from "next/link";
import { Plus, Link2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { listSmartLinks } from "@/lib/data/smart-links";
import { formatDateShort } from "@/lib/format";

export const metadata = { title: "Smart links. DVBBS HQ" };

export default async function SmartLinksPage() {
  const links = await listSmartLinks();

  return (
    <>
      <PageHeader
        eyebrow="releases"
        title="Smart links"
        description="One slug per release, routes to the listener's preferred platform."
        actions={
          <Link
            href="/releases/links/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden />
            New link
          </Link>
        }
      />
      {links.length === 0 ? (
        <div className="px-4 md:px-6 py-6">
          <EmptyState
            icon={<Link2 className="size-6" aria-hidden />}
            title="No smart links yet."
            description="Create one to start routing fans to the right platform."
            action={
              <Link
                href="/releases/links/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                <Plus className="size-4" aria-hidden />
                New link
              </Link>
            }
          />
        </div>
      ) : (
        <div className="px-4 md:px-6 py-4">
          <div className="overflow-hidden rounded-md border border-line bg-bg-surface">
            <table className="w-full text-sm">
              <thead className="bg-bg-elev text-fg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Slug</th>
                  <th className="px-3 py-2 text-left font-medium">Title</th>
                  <th className="px-3 py-2 text-right font-medium">Clicks</th>
                  <th className="px-3 py-2 text-right font-medium">Created</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {links.map((l) => (
                  <tr key={l.id} className="border-t border-line">
                    <td className="px-3 py-2 num">
                      <Link
                        href={`/releases/links/${l.id}`}
                        className="text-fg hover:underline"
                      >
                        /link/{l.slug}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-fg-muted">
                      {l.title ?? l.release_title ?? "."}
                    </td>
                    <td className="px-3 py-2 text-right num">
                      {l.click_count}
                    </td>
                    <td className="px-3 py-2 text-right num text-xs text-fg-muted">
                      {formatDateShort(l.created_at)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <a
                        href={`/link/${l.slug}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg"
                      >
                        Open
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
