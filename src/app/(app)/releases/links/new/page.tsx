import { PageHeader } from "@/components/ui/page-header";
import { listReleases } from "@/lib/data/releases";
import { NewLinkForm } from "./_components/new-link-form";

export const metadata = { title: "New smart link. DVBBS HQ" };

export default async function NewSmartLinkPage() {
  const releases = await listReleases();
  return (
    <>
      <PageHeader
        eyebrow="releases"
        title="New smart link"
        description="Pick a slug, optionally tie it to a release, paste platform URLs."
      />
      <NewLinkForm releases={releases} />
    </>
  );
}
