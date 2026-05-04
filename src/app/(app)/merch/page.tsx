import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Merch. DVBBS HQ" };

export default function MerchPage() {
  return (
    <ComingSoon
      eyebrow="merch"
      title="Products and inventory"
      phase={3}
      description="Tour-exclusive drops, inventory health, sales by show."
    />
  );
}
