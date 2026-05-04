import { PageHeader } from "@/components/ui/page-header";
import { requireMember } from "@/lib/auth/dal";
import { BandsintownSync } from "./_components/bandsintown-sync";

export const metadata = { title: "Settings. DVBBS HQ" };

export default async function SettingsPage() {
  const me = await requireMember();
  const hasBandsintown = !!process.env.BANDSINTOWN_API_KEY;
  const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <>
      <PageHeader eyebrow="settings" title="Profile and integrations" />
      <div className="px-4 md:px-6 py-6 grid gap-4 max-w-2xl">
        <section className="rounded-md border border-line bg-bg-surface p-4">
          <div className="marker">you</div>
          <dl className="mt-3 grid grid-cols-[120px_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-fg-muted">Email</dt>
            <dd>{me.email}</dd>
            <dt className="text-fg-muted">Display name</dt>
            <dd>{me.display_name ?? "."}</dd>
            <dt className="text-fg-muted">Role</dt>
            <dd className="marker">{me.role}</dd>
          </dl>
        </section>

        <section className="rounded-md border border-line bg-bg-surface p-4">
          <div className="marker">integrations</div>
          <h2 className="mt-1 text-sm font-medium">Bandsintown sync</h2>
          {hasBandsintown ? (
            <>
              <p className="mt-1 text-xs text-fg-muted">
                Daily Netlify function imports new Bandsintown events as leads.
                Run a one-off sync below.
              </p>
              {me.role === "principal" ? (
                <div className="mt-3">
                  <BandsintownSync />
                </div>
              ) : (
                <p className="mt-2 text-xs text-fg-dim">
                  Manual sync is principal-only.
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-xs text-fg-muted">
              Set BANDSINTOWN_API_KEY in env to enable. Daily sync runs once
              configured.
            </p>
          )}
        </section>

        <section className="rounded-md border border-line bg-bg-surface p-4">
          <div className="marker">integrations</div>
          <h2 className="mt-1 text-sm font-medium">Mapbox</h2>
          <p className="mt-1 text-xs text-fg-muted">
            {hasMapbox
              ? "Configured. World map renders pins on /tour/map."
              : "Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the world map."}
          </p>
        </section>
      </div>
    </>
  );
}
