import { PageHeader } from "@/components/ui/page-header";
import { listContacts } from "@/lib/data/contacts";
import { ShowWizard } from "./_components/show-wizard";

export const metadata = { title: "new show" };

export default async function NewShowPage() {
  const promoters = await listContacts("promoter");
  return (
    <>
      <PageHeader
        eyebrow="tour"
        title="New show"
        description="Three sections, basics, deal, detail. You can fill in the rest after creating."
      />
      <ShowWizard promoters={promoters} />
    </>
  );
}
