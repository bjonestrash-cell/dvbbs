import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import {
  getSmartLinkById,
  listClicks,
  clicksByPlatform,
  clicksByCountry,
  PLATFORM_LABEL,
} from "@/lib/data/smart-links";
import { formatDateCompact, formatRelative } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const link = await getSmartLinkById(id);
  if (!link) return { title: "smart link" };
  return { title: link.slug.toLowerCase() };
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
    clicksByCountry(link.id, 10),
  ]);

  const dests = link.destinations as Record<string, string>;
  const destEntries = Object.entries(dests);

  return (
    <>
      <PageHeader
        eyebrow="Catalog"
        title={link.title ?? `/link/${link.slug}`}
        description={`Public URL · /link/${link.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <a
              href={`/link/${link.slug}`}
              target="_blank"
              rel="noreferrer noopener"
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} aria-hidden />
              Open
            </a>
            <Link
              href="/releases/links"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
              All links
            </Link>
          </div>
        }
      />

      <div className="px-6 md:px-10 py-10 grid gap-10">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          <Stat label="Total clicks" value={link.click_count.toString()} />
          <Stat label="Platforms" value={destEntries.length.toString()} />
          <Stat
            label="Last click"
            value={recent[0] ? formatRelative(recent[0].clicked_at) : "—"}
            small
          />
          <Stat
            label="Top platform"
            value={
              byPlatform[0]
                ? PLATFORM_LABEL[byPlatform[0].platform as keyof typeof PLATFORM_LABEL] ??
                  byPlatform[0].platform
                : "—"
            }
            small
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section>
            <header className="mb-4">
              <div className="marker">Platforms</div>
              <h2 className="font-display text-[18px] text-fg mt-1">
                Click distribution
              </h2>
            </header>
            {byPlatform.length === 0 ? (
              <p className="font-sans text-[13px] text-fg-faint">No clicks yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {byPlatform.map((p) => {
                  const max = byPlatform[0].count;
                  const pct = Math.round((p.count / max) * 100);
                  return (
                    <li
                      key={p.platform}
                      className="grid grid-cols-[100px_1fr_50px] sm:grid-cols-[120px_1fr_60px] items-center gap-3"
                    >
                      <span className="font-sans text-[13px] text-fg">
                        {PLATFORM_LABEL[p.platform as keyof typeof PLATFORM_LABEL] ??
                          p.platform}
                      </span>
                      <span className="h-[2px] bg-surface-2 relative overflow-hidden">
                        <span
                          className="absolute left-0 top-0 h-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="num font-mono text-right text-[12px] text-fg-dim">
                        {p.count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section>
            <header className="mb-4">
              <div className="marker">Countries</div>
              <h2 className="font-display text-[18px] text-fg mt-1">Top 10</h2>
            </header>
            {byCountry.length === 0 ? (
              <p className="font-sans text-[13px] text-fg-faint">
                No geographic data yet.
              </p>
            ) : (
              <ul className="flex flex-col">
                {byCountry.map((c, i) => (
                  <li
                    key={c.country}
                    className={
                      "grid grid-cols-[1fr_60px] items-center py-2 " +
                      (i < byCountry.length - 1 ? "border-b border-line" : "")
                    }
                  >
                    <span className="font-sans text-[13px] text-fg">
                      {c.country}
                    </span>
                    <span className="num font-mono text-right text-[12px] text-fg-dim">
                      {c.count}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section>
          <header className="mb-4">
            <div className="marker">Destinations</div>
            <h2 className="font-display text-[18px] text-fg mt-1">
              Where each platform sends
            </h2>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {destEntries.map(([platform, url]) => (
              <li key={platform}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center justify-between border border-line bg-surface px-4 py-3 hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]"
                >
                  <span className="font-sans text-[13px] text-fg shrink-0">
                    {PLATFORM_LABEL[platform as keyof typeof PLATFORM_LABEL] ??
                      platform}
                  </span>
                  <span className="font-mono text-[11px] text-fg-faint truncate ml-3 min-w-0 max-w-[60%]">
                    {url}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <header className="mb-4">
            <div className="marker">Recent clicks</div>
            <h2 className="font-display text-[18px] text-fg mt-1">Last 20</h2>
          </header>
          {recent.length === 0 ? (
            <p className="font-sans text-[13px] text-fg-faint">No clicks yet.</p>
          ) : (
            <ul>
              {recent.map((c, i) => (
                <li
                  key={c.id}
                  className={
                    "grid grid-cols-[1fr_auto] sm:grid-cols-[110px_120px_1fr_60px] items-baseline gap-x-3 gap-y-1 py-3 " +
                    (i < recent.length - 1 ? "border-b border-line" : "")
                  }
                >
                  <span className="num font-mono text-[11px] text-fg-faint">
                    {formatRelative(c.clicked_at)}
                  </span>
                  <span className="font-mono text-[11px] text-fg-dim text-right sm:hidden">
                    {c.country ?? ""}
                  </span>
                  <span className="font-sans text-[12px] text-fg-dim">
                    {PLATFORM_LABEL[c.platform as keyof typeof PLATFORM_LABEL] ??
                      c.platform ??
                      "Unknown"}
                  </span>
                  <span className="font-mono text-[11px] text-fg-faint truncate hidden sm:block">
                    {c.user_agent ?? ""}
                  </span>
                  <span className="font-mono text-[11px] text-fg-dim text-right hidden sm:inline">
                    {c.country ?? ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p className="num font-mono text-[10px] text-fg-faint">
          Created {formatDateCompact(link.created_at)}.
        </p>
      </div>
    </>
  );
}

function Stat({
  label,
  value,
  small,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="marker">{label}</span>
      <span
        className="display-stat text-fg tabular"
        style={{
          fontSize: small ? "clamp(20px, 2.5vw, 24px)" : "clamp(32px, 4vw, 48px)",
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
