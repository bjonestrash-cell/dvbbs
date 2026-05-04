import { PageHeader } from "@/components/ui/page-header";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Team. DVBBS HQ" };

export default async function TeamPage() {
  const me = AUTH_DISABLED ? null : await getCurrentMember();

  if (AUTH_DISABLED) {
    return (
      <>
        <PageHeader
          eyebrow="team"
          title="Members and roles"
          description="Hidden in public demo. Sign in to manage."
        />
        <div className="px-4 md:px-6 py-6">
          <div className="rounded-md border border-line bg-bg-surface p-6">
            <div className="marker">demo</div>
            <p className="mt-2 text-sm text-fg-muted max-w-prose">
              Team members and emails are private even when the rest of the app
              is public. Re-enable auth to see this surface.
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
        eyebrow="team"
        title="Members and roles"
        description={
          me?.role === "principal"
            ? "Add or remove team members. Principal-only."
            : "View team. Adding members is principal-only."
        }
      />
      <div className="px-4 md:px-6 py-6">
        <div className="overflow-hidden rounded-md border border-line bg-bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-bg-elev text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Name</th>
                <th className="px-3 py-2 text-left font-medium">Email</th>
                <th className="px-3 py-2 text-left font-medium">Role</th>
                <th className="px-3 py-2 text-left font-medium tabular">Added</th>
              </tr>
            </thead>
            <tbody>
              {(members ?? []).map((m) => (
                <tr key={m.id} className="border-t border-line">
                  <td className="px-3 py-2">{m.display_name ?? "."}</td>
                  <td className="px-3 py-2 text-fg-muted">{m.email}</td>
                  <td className="px-3 py-2">
                    <span className="marker">{m.role}</span>
                  </td>
                  <td className="px-3 py-2 num text-fg-muted text-xs">
                    {new Date(m.created_at).toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
              {(!members || members.length === 0) ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-fg-muted">
                    No members yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {me?.role === "principal" ? (
          <p className="mt-3 text-xs text-fg-dim">
            Add member UI lands in Phase 1.5. For now, add emails to ALLOWED_AUTH_EMAILS env var and have them sign in.
          </p>
        ) : null}
      </div>
    </>
  );
}
