import { notFound } from "next/navigation";
import { getReleaseBySlug } from "@/lib/data/releases";
import { ReleaseEditForm } from "./_components/release-edit-form";
import { DeleteReleaseButton } from "./_components/delete-release-button";

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
    <div className="px-6 md:px-10 py-8 md:py-10 flex flex-col gap-6 max-w-3xl">
      <ReleaseEditForm release={release} />

      {/* Danger zone — separated panel so it's visually distinct from the
          edit form but reads as the same family. */}
      <section className="border border-line bg-surface px-5 py-5 md:px-6 md:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="marker">Danger</div>
          <p className="mt-1 font-sans text-[13px] text-fg-dim leading-[1.55] max-w-md">
            Deleting removes this release and any attached assets,
            marketing tasks, and smart-link mappings. This action can&apos;t
            be undone.
          </p>
        </div>
        <div className="shrink-0">
          <DeleteReleaseButton releaseId={release.id} title={release.title} />
        </div>
      </section>
    </div>
  );
}
