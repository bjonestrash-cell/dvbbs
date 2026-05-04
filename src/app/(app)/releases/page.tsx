import { ComingSoon } from "@/components/ui/coming-soon";

export const metadata = { title: "Releases. DVBBS HQ" };

export default function ReleasesPage() {
  return (
    <ComingSoon
      eyebrow="releases"
      title="Release roadmap"
      phase={2}
      description="Idea through release, asset checklists, marketing tasks, smart links."
    />
  );
}
