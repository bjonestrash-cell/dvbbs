import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { buttonClasses } from "@/components/ui/button";
import {
  getSmartLinkById,
  listClicks,
  clicksByPlatform,
  clicksByCountry,
  PLATFORM_LABEL,
} from "@/lib/data/smart-links";
import { formatDateShort } from "@/lib/format";
import { formatDistanceToNow, parseISO } from "date-fns";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = await getSmartLinkById(id);
  if (!link) return { title: "Smart link. DVBBS HQ" };
  return { title: `${link.slug}. DVBBS HQ` };
}

export default async function SmartLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = await getSmartLinkById(id);
  if (!link) notFound();

  const [recent, byPlatform, byCountry] = await Promise.all([
    listClicks(link.id, 20),
    clicksByPlatform(link.id),
    clicksByCountry(link.id, 5),
  ]);

  const dests = link.destinations as Record<string, string>;
  const destEntries = Object.entries(dests);

  return (
    <>
      <PageHeader
        eyebrow="smart link"
        title={link.title ?? `/link/${link.slug}`}
        description={`Public URL, /link/${link.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`/link/${link.slug}`}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonClasses({ variant: "secondary", size: "sm" })}
            >
              <ExternalLink className="size-4" aria-hidden />
              Open
            </a>
            <Link
              href="/releases/links"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="size-4" aria-hidden />
              All links
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-4 md:px-6 pt-4">
        <StatCard
          label="total clicks"
          value={link.click_count}
          hint="all time"
        />
        <StatCard
          label="platforms"
          value={destEntries.length}
          hint="destinations"
        />
        <StatCard
          label="last click"
          value={
            recent[0]
              ? formatDistanceToNow(parseISO(recent[0].clicked_at), {
                  addSuffix: false,
                })
              : "."
          }
          hint={recent[0]?.platform ?? ""}
        />
        <StatCard
          label="top platform"
          value={byPlatform[0]?.platform ?? "."}
          hint={byPlatform[0] ? `${byPlatform[0].count} clicks` : "no data"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-4 md:px-6 py-4">
        <section className="rounded-md border border-line bg-bg-surface p-4">
          <header className="mb-3">
            <div className="marker">platforms</div>
            <div className="text-sm text-fg">Click distribution</div>
          </header>
          {byPlatform.length === 0 ? (
            <p className="text-xs text-fg-dim">No clicks yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {byPlatform.map((p) => {
                const max = byPlatform[0].count;
                const pct = Math.round((p.count / max) * 100);
                return (
                  <li
                    key={p.platform}
                    className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-xs"
                  >
                    <span className="marker">
                      {PLATFORM_LABEL[p.platform as keyof typeof PLATFORM_LABEL] ??
                        p.platform}
                    </span>
                    <span className="h-1.5 rounded-full bg-bg-elev relative overflow-hidden">
                      <span
                        className="absolute left-0 top-0 h-full bg-accent"
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="num text-right text-fg-muted">
                      {p.count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-line bg-bg-surface p-4">
          <header className="mb-3">
            <div className="marker">countries</div>
            <div className="text-sm text-fg">Top 5</div>
          </header>
          {byCountry.length === 0 ? (
            <p className="text-xs text-fg-dim">No geographic data yet.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {byCountry.map((c) => (
                <li
                  key={c.country}
                  className="grid grid-cols-[1fr_60px] items-center text-xs"
                >
                  <span className="text-fg-muted">{c.country}</span>
                  <span className="num text-right text-fg-muted">{c.count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-line bg-bg-surface p-4 lg:col-span-2">
          <header className="mb-3">
            <div className="marker">destinations</div>
            <div className="text-sm text-fg">Where each platform sends</div>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {destEntries.map(([platform, url]) => (
              <li key={platform}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between rounded-md border border-line bg-bg-input px-3 py-2 text-sm transition-colors hover:border-line-strong"
                >
                  <span className="marker">
                    {PLATFORM_LABEL[platform as keyof typeof PLATFORM_LABEL] ??
                      platform}
                  </span>
                  <span className="truncate text-xs text-fg-muted ml-2">
                    {url}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-line bg-bg-surface p-4 lg:col-span-2">
          <header className="mb-3">
            <div className="marker">recent clicks</div>
            <div className="text-sm text-fg">Last 20</div>
          </header>
          {recent.length === 0 ? (
            <p className="text-xs text-fg-dim">No clicks yet.</p>
          ) : (
            <ul className="flex flex-col gap-1">
              {recent.map((c) => (
                <li
                  key={c.id}
                  className="grid grid-cols-[80px_80px_1fr_60px] items-baseline gap-3 text-xs"
                >
                  <span className="num text-fg-muted">
                    {formatDistanceToNow(parseISO(c.clicked_at), {
                      addSuffix: false,
                    })}
                  </span>
                  <span className="marker">
                    {c.platform ?? "unknown"}
                  </span>
                  <span className="text-fg-dim truncate">
                    {c.user_agent ?? ""}
                  </span>
                  <span className="text-right text-fg-muted">
                    {c.country ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="px-4 md:px-6 pb-6">
        <p className="text-xs text-fg-dim num">
          Created {formatDateShort(link.created_at)}.
        </p>
      </div>
    </>
  );
}
