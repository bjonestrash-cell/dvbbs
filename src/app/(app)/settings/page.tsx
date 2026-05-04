import { PageHeader } from "@/components/ui/page-header";
import { requireMember } from "@/lib/auth/dal";

export const metadata = { title: "Settings. DVBBS HQ" };

export default async function SettingsPage() {
  const me = await requireMember();
  return (
    <>
      <PageHeader eyebrow="settings" title="Profile and integrations" />
      <div className="px-4 md:px-6 py-6 grid gap-4 max-w-2xl">
        <div className="rounded-md border border-line bg-bg-surface p-4">
          <div className="marker">you</div>
          <dl className="mt-3 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-fg-muted">Email</dt>
            <dd>{me.email}</dd>
            <dt className="text-fg-muted">Display name</dt>
            <dd>{me.display_name ?? "."}</dd>
            <dt className="text-fg-muted">Role</dt>
            <dd className="marker">{me.role}</dd>
          </dl>
        </div>
        <div className="rounded-md border border-line bg-bg-surface p-4">
          <div className="marker">integrations</div>
          <p className="mt-2 text-sm text-fg-muted">
            Bandsintown sync and Mapbox config land in Phase 1.5.
          </p>
        </div>
      </div>
    </>
  );
}
