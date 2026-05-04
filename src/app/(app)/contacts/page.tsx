import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export const metadata = { title: "Contacts. DVBBS HQ" };

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rolodex"
        title="Contacts"
        description="Promoters, venues, agents, label, press, crew. One place."
      />
      <div className="px-6 md:px-10 py-10">
        <EmptyState
          title="Your rolodex is empty."
          hint="Contacts get created the first time you add a show with a promoter."
        />
      </div>
    </>
  );
}
