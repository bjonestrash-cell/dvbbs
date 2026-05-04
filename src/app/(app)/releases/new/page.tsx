import { PageHeader } from "@/components/ui/page-header";
import { NewReleaseForm } from "./_components/new-release-form";

export const metadata = { title: "New release. DVBBS HQ" };

export default function NewReleasePage() {
  return (
    <>
      <PageHeader
        eyebrow="releases"
        title="New release"
        description="Three sections, basics, release window, notes. Assets and marketing land on the detail page."
      />
      <NewReleaseForm />
    </>
  );
}
