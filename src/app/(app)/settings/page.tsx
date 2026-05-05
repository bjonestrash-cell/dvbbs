import { PageHeader } from "@/components/ui/page-header";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { BandsintownSync } from "./_components/bandsintown-sync";

export const metadata = { title: "settings" };

export default async function SettingsPage() {
  const me = AUTH_DISABLED ? null : await getCurrentMember();
  const hasBandsintown = !!process.env.BANDSINTOWN_API_KEY;

  return (
    <>
      <PageHeader
        eyebrow="Config"
        title="Settings"
        description="Profile, tools, integrations."
      />
      <div className="px-6 md:px-10 py-8 md:py-10 flex flex-col gap-8 max-w-2xl">
        <Section title="You" eyebrow="Profile">
          {me ? (
            <dl>
              <Row label="Email" value={me.email} />
              <Row label="Display name" value={me.display_name ?? "—"} />
              <Row label="Role" value={me.role} mono last />
            </dl>
          ) : (
            <p className="font-sans text-[13px] text-fg-dim">
              Public demo. No signed-in user.
            </p>
          )}
        </Section>

        <Section title="Bandsintown sync" eyebrow="Integration">
          {hasBandsintown ? (
            <>
              <p className="font-sans text-[13px] text-fg-dim leading-[1.55] max-w-[44ch]">
                A daily Netlify function imports new Bandsintown events as
                leads. Run a one-off sync below.
              </p>
              {me?.role === "principal" ? (
                <div className="mt-4">
                  <BandsintownSync />
                </div>
              ) : (
                <p className="mt-3 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint">
                  Manual sync is principal-only.
                </p>
              )}
            </>
          ) : (
            <p className="font-sans text-[13px] text-fg-dim leading-[1.55] max-w-[44ch]">
              Set <code className="font-mono text-[12px] text-fg">BANDSINTOWN_API_KEY</code>{" "}
              in env to enable. Daily sync runs once configured.
            </p>
          )}
        </Section>
      </div>
    </>
  );
}

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-surface p-5 md:p-6">
      <header className="mb-4">
        <div className="marker">{eyebrow}</div>
        <h2
          className="font-display text-[20px] text-fg mt-1"
          style={{ fontWeight: 500, letterSpacing: "-0.01em" }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: string;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        "grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 py-3 " +
        (last ? "" : "border-b border-line")
      }
    >
      <dt className="label pt-1">{label}</dt>
      <dd
        className={
          (mono
            ? "font-mono text-[12px] uppercase tracking-[0.06em] "
            : "font-sans text-[14px] ") + "text-fg break-words"
        }
      >
        {value}
      </dd>
    </div>
  );
}
