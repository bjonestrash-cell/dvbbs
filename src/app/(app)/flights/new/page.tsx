import { PageHeader } from "@/components/ui/page-header";
import { listShows } from "@/lib/data/shows";
import { NewFlightForm } from "./_components/new-flight-form";

export const metadata = { title: "new flight" };

export default async function NewFlightPage() {
  const shows = await listShows();
  return (
    <>
      <PageHeader
        eyebrow="Travel"
        title="New flight"
        description="Quick to key in. Pick a show and we'll pre-fill the route."
      />
      <NewFlightForm shows={shows} />
    </>
  );
}
