import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Finance. DVBBS HQ" };

export default function FinancePage() {
  return (
    <ComingSoon
      eyebrow="finance"
      title="Revenue and outstanding"
      phase={4}
      description="Revenue across tour, releases, merch. Outstanding settlements at a glance."
    />
  );
}
