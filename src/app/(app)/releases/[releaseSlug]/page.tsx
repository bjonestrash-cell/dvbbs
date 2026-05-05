import { notFound } from "next/navigation";
import { getReleaseBySlug } from "@/lib/data/releases";
import { formatDateCompact } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) return { title: "Release. DVBBS HQ" };
  return { title: `${release.title}. DVBBS HQ` };
}

export default async function ReleaseOverviewPage({
  params,
}: {
  params: Promise<{ releaseSlug: string }>;
}) {
  const { releaseSlug } = await params;
  const release = await getReleaseBySlug(releaseSlug);
  if (!release) notFound();

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Title", value: release.title },
    { label: "Type", value: release.type },
    { label: "Label", value: release.label ?? "." },
    { label: "ISRC", value: release.isrc ?? "." },
    { label: "UPC", value: release.upc ?? "." },
    {
      label: "Release date",
      value: release.release_date
        ? formatDateCompact(release.release_date)
        : ".",
    },
    {
      label: "Collaborators",
      value: release.collaborators?.length
        ? release.collaborators.join(", ")
        : ".",
    },
    {
      label: "Splits",
      value: release.splits ? JSON.stringify(release.splits) : ".",
    },
    {
      label: "Smart link",
      value: release.smart_link_slug
        ? `/link/${release.smart_link_slug}`
        : ".",
    },
  ];

  return (
    <div className="px-6 md:px-10 py-8 md:py-10 grid gap-8 md:gap-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section>
        <header className="mb-6">
          <div className="marker">Details</div>
        </header>
        <dl>
          {fields.map((f, i) => (
            <div
              key={f.label}
              className={
                "py-3 grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr] sm:gap-4 " +
                (i < fields.length - 1 ? "border-b border-line" : "")
              }
            >
              <dt className="label pt-1">{f.label}</dt>
              <dd className="font-sans text-[14px] text-fg break-words">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <header className="mb-6">
          <div className="marker">Notes</div>
        </header>
        {release.notes ? (
          <p className="font-sans text-[14px] text-fg leading-[1.7] whitespace-pre-line max-w-[480px]">
            {release.notes}
          </p>
        ) : (
          <p className="font-sans text-[13px] text-fg-faint">No notes yet.</p>
        )}
      </section>
    </div>
  );
}
