import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppRole, TeamMember } from "@/lib/supabase/types";

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export const getCurrentMember = cache(async (): Promise<TeamMember | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("team_members")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as TeamMember | null) ?? null;
});

export async function requireMember(): Promise<TeamMember> {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return member;
}

export async function requireRole(...roles: AppRole[]): Promise<TeamMember> {
  const member = await requireMember();
  if (!roles.includes(member.role)) redirect("/tour");
  return member;
}
