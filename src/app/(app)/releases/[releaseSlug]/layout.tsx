import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ReleaseStatusPill } from "@/components/ui/release-status-pill";
import { buttonClasses } from "@/components/ui/button";
import { getReleaseBySlug } from "@/lib/data/releases";
import { formatDateLong } from "@/lib/format";
import { ReleaseTabs } from "./_components/release-tabs";

const TYPE_LABEL: Record<string, string> = {
  single: "Single",
  ep: "EP",
  album: "Album",
  remix: "Remix",
  edit: "Edit",
  bootleg: "Bootleg",
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
      <PageHeader
        eyebrow="release"
        title={release.title}
        description={
          release.release_date
            ? formatDateLong(release.release_date)
            : "No release date set"
        }
        actions={
          <Link
            href="/releases"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            All releases
          </Link>
        }
      />
      <div className="px-4 md:px-6 py-3 flex flex-wrap items-center gap-3 border-b border-line">
        <ReleaseStatusPill status={release.status} />
        <span className="marker">{TYPE_LABEL[release.type] ?? release.type}</span>
        {release.label ? (
          <span className="text-xs text-fg-muted">{release.label}</span>
        ) : null}
        {release.collaborators?.length ? (
          <span className="text-xs text-fg-muted">
            with {release.collaborators.join(", ")}
          </span>
        ) : null}
      </div>
      <ReleaseTabs slug={releaseSlug} />
      {children}
    </>
  );
}
