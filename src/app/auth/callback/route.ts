import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isWhitelisted } from "@/lib/auth/whitelist";

type TeamMemberRow = {
  id: string;
  user_id: string | null;
  email: string;
  role: string;
};

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/tour";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Missing auth code.")}`,
    );
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError.message)}`,
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Could not resolve user.")}`,
    );
  }

  const email = user.email.toLowerCase();

  if (!isWhitelisted(email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Email not on the team.")}`,
    );
  }

  // Admin client bypasses RLS for the bootstrap path. Cast to any while we
  // rely on the database CLI generator for typed schema in a follow-up.
  const admin = createAdminClient() as unknown as {
    from: (t: string) => {
      select: (s: string, opts?: { count?: "exact"; head?: boolean }) => {
        eq: (k: string, v: string) => {
          maybeSingle: () => Promise<{ data: TeamMemberRow | null }>;
        };
        count: number | null;
      } & Promise<{ count: number | null }>;
      insert: (row: Record<string, unknown>) => Promise<{ error: unknown }>;
      update: (row: Record<string, unknown>) => {
        eq: (k: string, v: string) => Promise<{ error: unknown }>;
      };
    };
  };

  const byUserResp = await admin
    .from("team_members")
    .select("id, user_id, email, role")
    .eq("user_id", user.id)
    .maybeSingle();
  const byUser = byUserResp.data;

  if (!byUser) {
    const byEmailResp = await admin
      .from("team_members")
      .select("id, user_id, role")
      .eq("email", email)
      .maybeSingle();
    const byEmail = byEmailResp.data;

    if (byEmail) {
      if (!byEmail.user_id) {
        await admin
          .from("team_members")
          .update({ user_id: user.id })
          .eq("id", byEmail.id);
      }
    } else {
      const { count } = await admin
        .from("team_members")
        .select("*", { count: "exact", head: true });

      if (!count || count === 0) {
        await admin.from("team_members").insert({
          user_id: user.id,
          email,
          role: "principal",
          display_name:
            (user.user_metadata as { name?: string } | null)?.name ?? null,
        });
      } else {
        await supabase.auth.signOut();
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent(
            "Ask a principal to add you to the team.",
          )}`,
        );
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
