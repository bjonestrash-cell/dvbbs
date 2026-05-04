import { PageHeader } from "@/components/ui/page-header";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { BandsintownSync } from "./_components/bandsintown-sync";

export const metadata = { title: "Settings. DVBBS HQ" };

export default async function SettingsPage() {
  const me = AUTH_DISABLED ? null : await getCurrentMember();
  const hasBandsintown = !!process.env.BANDSINTOWN_API_KEY;
  const hasMapbox = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <>
      <PageHeader
        eyebrow="Config"
        title="Settings"
        description="Profile, identity, third-party integrations."
      />
      <div className="px-6 md:px-10 py-10 grid gap-8 max-w-2xl">
        <Section title="You">
          {me ? (
            <dl>
              <Row label="Email" value={me.email} />
              <Row label="Display name" value={me.display_name ?? "—"} />
              <Row label="Role" value={me.role} mono />
            </dl>
          ) : (
            <p className="font-sans text-[13px] text-fg-faint">
              Public demo. No signed-in user.
            </p>
          )}
        </Section>

        <Section title="Bandsintown sync">
          {hasBandsintown ? (
            <>
              <p className="font-sans text-[13px] text-fg-dim max-w-prose">
                A daily Netlify function imports new Bandsintown events as
                leads. Run a one-off sync below.
              </p>
              {me?.role === "principal" ? (
                <div className="mt-4">
                  <BandsintownSync />
                </div>
              ) : (
                <p className="mt-2 font-sans text-[12px] text-fg-faint">
                  Manual sync is principal-only.
                </p>
              )}
            </>
          ) : (
            <p className="font-sans text-[13px] text-fg-dim max-w-prose">
              Set BANDSINTOWN_API_KEY in env to enable. Daily sync runs once
              configured.
            </p>
          )}
        </Section>

        <Section title="Mapbox">
          <p className="font-sans text-[13px] text-fg-dim max-w-prose">
            {hasMapbox
              ? "Configured. World map renders pins on /tour/map."
              : "Set NEXT_PUBLIC_MAPBOX_TOKEN to enable the world map."}
          </p>
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-4">
        <h2 className="font-display text-[20px] text-fg">{title}</h2>
      </header>
      <div className="border-y border-line py-6">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-2">
      <dt className="label pt-1">{label}</dt>
      <dd
        className={
          (mono ? "font-mono text-[12px] uppercase tracking-[0.06em] " : "font-sans text-[14px] ") +
          "text-fg break-words"
        }
      >
        {value}
      </dd>
    </div>
  );
}
