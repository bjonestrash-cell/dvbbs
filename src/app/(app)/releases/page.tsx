import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import { listReleases, groupByReleaseStatus } from "@/lib/data/releases";
import { ReleaseBoard } from "./_components/release-board";

export const metadata = { title: "Releases. DVBBS HQ" };

export default async function ReleasesPage() {
  const releases = await listReleases();
  const groups = groupByReleaseStatus(releases);

  return (
    <>
      <PageHeader
        eyebrow="releases"
        title="Catalog"
        description="Idea through release. Drag a card later to change status."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/releases/links"
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              <span className="opacity-60">[</span>SMART LINKS<span className="opacity-60">]</span>
            </Link>
            <Link
              href="/releases/new"
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              <span className="opacity-60">[</span>+ NEW RELEASE<span className="opacity-60">]</span>
            </Link>
          </div>
        }
      />

      {releases.length === 0 ? (
        <div className="px-4 md:px-6 py-6">
          <EmptyState
            title="CATALOG IS QUIET. SHIP A TRACK."
            hint="ADD THE FIRST IDEA TO START THE ROADMAP."
            action={
              <Link
                href="/releases/new"
                className={buttonClasses({ variant: "bracket", size: "sm" })}
              >
                <span className="opacity-60">[</span>+ NEW RELEASE<span className="opacity-60">]</span>
              </Link>
            }
          />
        </div>
      ) : (
        <ReleaseBoard groups={groups} />
      )}
    </>
  );
}
