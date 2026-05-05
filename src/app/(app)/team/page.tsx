import { PageHeader } from "@/components/ui/page-header";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { formatDateCompact } from "@/lib/format";

export const metadata = { title: "Team. DVBBS HQ" };

export default async function TeamPage() {
  const me = AUTH_DISABLED ? null : await getCurrentMember();

  if (AUTH_DISABLED) {
    return (
      <>
        <PageHeader
          eyebrow="Crew"
          title="Team"
          description="Hidden in public demo. Sign in to manage."
        />
        <div className="px-6 md:px-10 py-10">
          <div className="border border-line bg-surface px-6 py-10">
            <div className="marker mb-3">Demo</div>
            <p className="font-sans text-[14px] text-fg-dim max-w-prose">
              Team members and emails are kept private even when the rest of the
              app is public. Re-enable auth to see this surface.
            </p>
          </div>
        </div>
      </>
    );
  }

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <>
      <PageHeader
        eyebrow="Crew"
        title="Team"
        description={
          me?.role === "principal"
            ? "Add or remove. Principal-only."
            : "View only. Add is principal-only."
        }
      />
      <div className="px-6 md:px-10 py-10">
        <div className="border-y border-line">
          <div className="grid grid-cols-[1fr_1.5fr_120px_120px] items-center gap-4 px-4 py-3 border-b border-line">
            <span className="label">Name</span>
            <span className="label">Email</span>
            <span className="label">Role</span>
            <span className="label">Added</span>
          </div>
          {(members ?? []).map((m) => (
            <div
              key={m.id}
              className="grid grid-cols-[1fr_1.5fr_120px_120px] items-center gap-4 px-4 py-4 border-b border-line"
            >
              <span className="font-sans text-[14px] text-fg">
                {m.display_name ?? "—"}
              </span>
              <span className="font-sans text-[13px] text-fg-dim truncate">
                {m.email}
              </span>
              <span className="font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim">
                {m.role}
              </span>
              <span className="num font-mono text-[11px] text-fg-faint">
                {formatDateCompact(m.created_at)}
              </span>
            </div>
          ))}
          {(!members || members.length === 0) ? (
            <p className="px-4 py-6 text-center font-sans text-[13px] text-fg-faint">
              No members yet.
            </p>
          ) : null}
        </div>
        {me?.role === "principal" ? (
          <p className="mt-4 font-sans text-[12px] text-fg-faint">
            Add member UI lands later. For now, add emails to ALLOWED_AUTH_EMAILS env var and have them sign in.
          </p>
        ) : null}
      </div>
    </>
  );
}
