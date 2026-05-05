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
        eyebrow="Catalog"
        title="Releases"
        description="Records, idea to release."
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/releases/links"
              className={buttonClasses({ variant: "bracket", size: "sm" })}
            >
              Smart links
            </Link>
            <Link
              href="/releases/new"
              className={buttonClasses({ variant: "primary", size: "sm" })}
            >
              + New release
            </Link>
          </div>
        }
      />

      {releases.length === 0 ? (
        <div className="px-6 md:px-10 py-10">
          <EmptyState
            title="The catalog is quiet."
            hint="Schedule a release to start the roadmap."
            action={
              <Link
                href="/releases/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                + New release
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
