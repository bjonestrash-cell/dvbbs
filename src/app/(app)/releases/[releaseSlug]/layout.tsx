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
  single: "Single",
  ep: "EP",
  album: "Album",
  remix: "Remix",
  edit: "Edit",
  bootleg: "Bootleg",
};

const STATUS_LABEL: Record<string, string> = {
  idea: "Idea",
  in_production: "In production",
  mixing: "Mixing",
  mastered: "Mastered",
  delivered: "Delivered",
  scheduled: "Scheduled",
  released: "Released",
  archived: "Archived",
};

function sentenceCase(s: string | null): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

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
        <div className="px-6 md:px-10 pt-6 pb-3 flex items-center justify-between gap-4">
          <Link
            href="/releases"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            All releases
          </Link>
          <CopySmartLinkButton slug={release.smart_link_slug} />
        </div>
        <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-6 md:gap-8 md:items-end">
          <CoverArt url={release.cover_art_url} title={release.title} />
          <div className="min-w-0 flex-1">
            <div className="marker mb-2">Catalog</div>
            <h1
              className="display-title text-fg break-words"
              style={{
                fontSize: "clamp(36px, 6vw, 56px)",
              }}
            >
              {sentenceCase(release.title)}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-fg-dim">
              <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                {TYPE_LABEL[release.type] ?? release.type}
              </span>
              <span className="text-fg-faint">·</span>
              <StatusBracket tone={STATUS_TONE[release.status] ?? "default"}>
                {STATUS_LABEL[release.status] ?? release.status}
              </StatusBracket>
              <span className="text-fg-faint">·</span>
              <span className="num font-mono text-[11px] text-fg-dim">
                {release.release_date
                  ? formatDateCompact(release.release_date)
                  : "Date TBD"}
              </span>
            </div>
            {release.collaborators?.length ? (
              <div className="mt-2 font-sans text-[13px] text-fg-faint truncate">
                with {release.collaborators.join(", ")}
              </div>
            ) : null}
            <div className="mt-5">
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
      <div className="size-[160px] shrink-0 grid place-items-center bg-surface-2 border-b border-line">
        <Disc3
          className="size-10 text-fg-faint"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-[160px] shrink-0 border-b border-line object-cover"
    />
  );
}
