import { PageHeader } from "./page-header";

export function ComingSoon({
  eyebrow,
  title,
  phase,
  description,
}: {
  eyebrow: string;
  title: string;
  phase: 2 | 3 | 4;
  description?: string;
}) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="px-4 md:px-6 py-8 md:py-12">
        <div className="rounded-md border border-line bg-bg-surface p-6">
          <div className="marker">phase {phase}</div>
          <h2 className="mt-1 text-lg font-medium">Not yet built.</h2>
          <p className="mt-2 max-w-prose text-sm text-fg-muted">
            This surface ships after Tour Command Center stabilizes. Phase 1 first, then this.
          </p>
        </div>
      </div>
    </>
  );
}
