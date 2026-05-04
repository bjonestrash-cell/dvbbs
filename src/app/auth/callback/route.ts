import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isWhitelisted } from "@/lib/auth/whitelist";

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

  // Bootstrap or attach team_members row using service role (bypasses RLS).
  const admin = createAdminClient();

  const { data: byUser } = await admin
    .from("team_members")
    .select("id, role, user_id, email")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!byUser) {
    const { data: byEmail } = await admin
      .from("team_members")
      .select("id, user_id, role")
      .eq("email", email)
      .maybeSingle();

    if (byEmail) {
      // Pre-provisioned by a principal. Attach this auth user.
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
        // First user, becomes principal.
        await admin.from("team_members").insert({
          user_id: user.id,
          email,
          role: "principal",
          display_name: user.user_metadata?.name ?? null,
        });
      } else {
        // Whitelisted in env but not provisioned by a principal. Reject.
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
