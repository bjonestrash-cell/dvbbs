import { notFound } from "next/navigation";
import { getReleaseBySlug } from "@/lib/data/releases";
import { listMarketing } from "@/lib/data/release-relations";
import { MarketingList } from "../_components/marketing-list";

export const metadata = { title: "marketing" };

export default async function ReleaseMarketingPage({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) notFound();
  const tasks = await listMarketing(release.id);

  return (
    <div className="px-4 md:px-6 py-4">
      <MarketingList
        releaseId={release.id}
        releaseSlug={releaseSlug}
        tasks={tasks}
      />
    </div>
  );
}
