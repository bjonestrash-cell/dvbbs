import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Inbox. DVBBS HQ" };

export default function InboxPage() {
  return (
    <ComingSoon
      eyebrow="inbox"
      title="Booking inquiries"
      phase={4}
      description="Forwarded emails and offers, triaged into the pipeline."
    />
  );
}
