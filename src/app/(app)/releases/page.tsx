import Link from "next/link";
import { Plus, Disc3 } from "lucide-react";
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
        title="Roadmap"
        description="Idea through release. Drag a card later to change status."
        actions={
          <Link
            href="/releases/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden />
            New release
          </Link>
        }
      />

      {releases.length === 0 ? (
        <div className="px-4 md:px-6 py-6">
          <EmptyState
            icon={<Disc3 className="size-6" aria-hidden />}
            title="No releases yet."
            description="Add the first track or EP to start the roadmap."
            action={
              <Link
                href="/releases/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                <Plus className="size-4" aria-hidden />
                New release
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
