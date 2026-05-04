import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMember } from "@/lib/auth/dal";

export async function logShowActivity(
  show_id: string,
  action: string,
  detail: Record<string, unknown> | null = null,
): Promise<void> {
  const supabase = await createClient();
  const member = await getCurrentMember();
  await supabase.from("show_activity").insert({
    show_id,
    team_member_id: member?.id ?? null,
    action,
    detail,
  });
}
