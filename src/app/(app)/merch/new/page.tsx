import { PageHeader } from "@/components/ui/page-header";
import { listShows } from "@/lib/data/shows";
import { NewMerchForm } from "./_components/new-merch-form";

export const metadata = { title: "New product. DVBBS HQ" };

export default async function NewMerchPage() {
  const today = new Date().toISOString().slice(0, 10);
  const shows = await listShows({ from: today });
  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="New product"
        description="Three sections: product, pricing, image. Tour exclusivity optional."
      />
      <NewMerchForm shows={shows} />
    </>
  );
}
