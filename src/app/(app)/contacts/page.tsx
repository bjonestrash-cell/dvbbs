import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Users } from "lucide-react";

export const metadata = { title: "Contacts. DVBBS HQ" };

export default function ContactsPage() {
  return (
    <>
      <PageHeader
        eyebrow="contacts"
        title="Promoters, venues, agents, crew"
        description="Single source of truth for everyone you work with."
      />
      <div className="px-4 md:px-6 py-6">
        <EmptyState
          icon={<Users className="size-6" aria-hidden />}
          title="Contacts list lands with show creation."
          description="The first contacts will be added when you create a show."
        />
      </div>
    </>
  );
}
