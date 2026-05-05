import { PageHeader } from "@/components/ui/page-header";
import { NewContactForm } from "./_components/new-contact-form";

export const metadata = { title: "new contact" };

export default function NewContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Rolodex"
        title="New contact"
        description="Identity, contact details, notes."
      />
      <NewContactForm />
    </>
  );
}
