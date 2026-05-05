import { notFound } from "next/navigation";
import { getReleaseBySlug } from "@/lib/data/releases";
import { listAssets } from "@/lib/data/release-relations";
import { AssetsList } from "../_components/assets-list";

export const metadata = { title: "assets" };

export default async function ReleaseAssetsPage({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) notFound();
  const assets = await listAssets(release.id);

  return (
    <div className="px-4 md:px-6 py-4">
      <AssetsList
        releaseId={release.id}
        releaseSlug={releaseSlug}
        assets={assets}
      />
    </div>
  );
}
