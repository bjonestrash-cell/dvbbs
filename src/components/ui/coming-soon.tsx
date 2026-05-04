import { PageHeader } from "./page-header";
import { ChevronGlyph } from "@/components/brand/logo";

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
      <div className="px-6 md:px-10 py-16 flex flex-col items-center text-center gap-4">
        <ChevronGlyph size={20} className="text-fg-faint" opacity={0.6} />
        <div
          className="display-title text-fg"
          style={{ fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 300 }}
        >
          Phase {phase} surface, not built yet.
        </div>
        <p className="font-sans text-[13px] text-fg-dim max-w-prose">
          This part of the app ships after the wedge stabilizes. Tour and
          Releases come first.
        </p>
      </div>
    </>
  );
}
