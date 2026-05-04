import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Disc3 } from "lucide-react";
import { getReleaseBySlug } from "@/lib/data/releases";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) return { title: "Release. DVBBS HQ" };
  return { title: `${release.title}. DVBBS HQ` };
}

export default async function ReleaseOverviewPage({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) notFound();

  return (
    <div className="px-4 md:px-6 py-4 flex flex-col gap-4">
      <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
        <header className="mb-3">
          <div className="marker">overview</div>
          <div className="text-sm text-fg">Cover, splits, IDs</div>
        </header>
        <div className="flex flex-col md:flex-row gap-4">
          <CoverArt url={release.cover_art_url} title={release.title} />
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <KV label="ISRC" value={release.isrc ?? "."} />
            <KV label="UPC" value={release.upc ?? "."} />
            <KV label="Label" value={release.label ?? "."} />
            <KV
              label="Release date"
              value={release.release_date ?? "."}
            />
            <KV
              label="Collaborators"
              value={
                release.collaborators?.length
                  ? release.collaborators.join(", ")
                  : "."
              }
              full
            />
          </div>
        </div>
      </section>

      <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
        <header className="mb-3">
          <div className="marker">streaming</div>
          <div className="text-sm text-fg">Smart link and platform URLs</div>
        </header>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <LinkPill label="Spotify" url={release.spotify_url} />
          <LinkPill label="Apple Music" url={release.apple_url} />
          <LinkPill label="SoundCloud" url={release.soundcloud_url} />
          <LinkPill label="YouTube" url={release.youtube_url} />
          <LinkPill label="Beatport" url={release.beatport_url} />
          <LinkPill label="Pre-save" url={release.presave_url} />
        </div>
        {release.smart_link_slug ? (
          <p className="mt-3 text-xs text-fg-muted">
            Smart link, <Link href={`/link/${release.smart_link_slug}`} className="text-fg underline">/link/{release.smart_link_slug}</Link>
          </p>
        ) : null}
      </section>

      {release.notes ? (
        <section className="rounded-md border border-line bg-bg-surface p-4 md:p-5">
          <header className="mb-2">
            <div className="marker">notes</div>
          </header>
          <p className="text-sm text-fg-muted whitespace-pre-line">
            {release.notes}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function CoverArt({ url, title }: { url: string | null; title: string }) {
  if (!url) {
    return (
      <div className="size-32 shrink-0 grid place-items-center rounded-md bg-bg-elev border border-line">
        <Disc3 className="size-8 text-fg-dim" aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-32 shrink-0 rounded-md border border-line object-cover"
    />
  );
}

function KV({
  label,
  value,
  full,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={"flex flex-col gap-0.5" + (full ? " sm:col-span-2" : "")}>
      <span className="marker">{label}</span>
      <span className="num text-fg">{value}</span>
    </div>
  );
}

function LinkPill({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center justify-between rounded-md border border-line bg-bg-input/50 px-3 py-2 text-sm text-fg-dim">
        <span>{label}</span>
        <span className="text-[10px] uppercase tracking-wide">none</span>
      </div>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center justify-between rounded-md border border-line bg-bg-input px-3 py-2 text-sm text-fg transition-colors hover:border-line-strong"
    >
      <span>{label}</span>
      <ExternalLink className="size-3.5 text-fg-muted" aria-hidden />
    </a>
  );
}
