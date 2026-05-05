import { notFound } from "next/navigation";
import { getReleaseBySlug } from "@/lib/data/releases";
import { ReleaseEditForm } from "./_components/release-edit-form";

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
    <div className="px-6 md:px-10 py-8 md:py-10">
      <div className="max-w-3xl">
        <ReleaseEditForm release={release} />
      </div>
    </div>
  );
}
