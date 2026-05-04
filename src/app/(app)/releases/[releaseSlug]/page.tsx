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
    { label: "TITLE", value: release.title },
    { label: "TYPE", value: release.type },
    { label: "LABEL", value: release.label ?? "." },
    { label: "ISRC", value: release.isrc ?? "." },
    { label: "UPC", value: release.upc ?? "." },
    {
      label: "RELEASE DATE",
      value: release.release_date
        ? formatDateCompact(release.release_date)
        : ".",
    },
    {
      label: "COLLABORATORS",
      value: release.collaborators?.length
        ? release.collaborators.join(", ")
        : ".",
    },
    {
      label: "SPLITS",
      value: release.splits ? JSON.stringify(release.splits) : ".",
    },
    {
      label: "SMART LINK",
      value: release.smart_link_slug
        ? `/link/${release.smart_link_slug}`
        : ".",
    },
  ];

  return (
    <div className="px-4 md:px-6 py-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section className="border border-line bg-surface">
        <div className="px-4 py-3 border-b border-line">
          <div className="marker">DETAILS</div>
        </div>
        <dl>
          {fields.map((f, i) => (
            <div
              key={f.label}
              className={
                "grid grid-cols-[140px_1fr] gap-3 px-4 py-2.5 text-[12px] " +
                (i < fields.length - 1 ? "border-b border-line" : "")
              }
            >
              <dt className="label">{f.label}</dt>
              <dd className="font-mono text-fg uppercase tracking-[0.04em] truncate">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border border-line bg-surface">
        <div className="px-4 py-3 border-b border-line">
          <div className="marker">NOTES</div>
        </div>
        <div className="px-4 py-4">
          {release.notes ? (
            <p className="font-mono text-[12px] text-fg-dim leading-[1.5] whitespace-pre-line">
              {release.notes}
            </p>
          ) : (
            <p className="marker">NO NOTES YET.</p>
          )}
        </div>
      </section>
    </div>
  );
}
