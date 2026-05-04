import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Disc3 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import { getReleaseBySlug } from "@/lib/data/releases";
import { formatDateCompact } from "@/lib/format";
import { ReleaseTabs } from "./_components/release-tabs";
import { StreamingIcons } from "./_components/streaming-icons";
import { CopySmartLinkButton } from "./_components/copy-smart-link";

const TYPE_LABEL: Record<string, string> = {
  single: "SINGLE",
  ep: "EP",
  album: "ALBUM",
  remix: "REMIX",
  edit: "EDIT",
  bootleg: "BOOTLEG",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "IDEA",
  in_production: "IN PRODUCTION",
  mixing: "MIXING",
  mastered: "MASTERED",
  delivered: "DELIVERED",
  scheduled: "SCHEDULED",
  released: "RELEASED",
  archived: "ARCHIVED",
};

export default async function ReleaseLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) notFound();

  return (
    <>
      <header className="border-b border-line">
        <div className="px-4 md:px-6 pt-6 pb-3 flex items-start justify-between gap-4">
          <Link
            href="/releases"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            ALL RELEASES
          </Link>
          <CopySmartLinkButton slug={release.smart_link_slug} />
        </div>
        <div className="px-4 md:px-6 pb-6 flex flex-col md:flex-row gap-5 md:gap-6 md:items-end">
          <CoverArt url={release.cover_art_url} title={release.title} />
          <div className="min-w-0 flex-1">
            <div className="marker mb-2">
              RELEASE <span className="opacity-60">/</span>
            </div>
            <h1
              className="display-title text-fg break-words"
              style={{
                fontSize: "clamp(36px, 7vw, 64px)",
              }}
            >
              {release.title.toUpperCase()}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-fg-dim">
              <StatusBracket tone="default">
                {TYPE_LABEL[release.type] ?? release.type.toUpperCase()}
              </StatusBracket>
              <span className="text-fg-faint">·</span>
              <StatusBracket tone={STATUS_TONE[release.status] ?? "default"}>
                {STATUS_LABEL[release.status] ?? release.status.toUpperCase()}
              </StatusBracket>
              <span className="text-fg-faint">·</span>
              <span className="num font-mono text-[11px] text-fg-dim">
                {release.release_date
                  ? formatDateCompact(release.release_date)
                  : "DATE TBD"}
              </span>
            </div>
            {release.collaborators?.length ? (
              <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.08em] text-fg-faint truncate">
                WITH {release.collaborators.join(", ")}
              </div>
            ) : null}
            <div className="mt-4">
              <StreamingIcons release={release} />
            </div>
          </div>
        </div>
      </header>
      <ReleaseTabs slug={releaseSlug} />
      {children}
    </>
  );
}

function CoverArt({ url, title }: { url: string | null; title: string }) {
  if (!url) {
    return (
      <div className="size-[120px] shrink-0 grid place-items-center bg-surface-2 border border-line">
        <Disc3 className="size-8 text-fg-faint" aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-[120px] shrink-0 border border-line object-cover"
    />
  );
}
