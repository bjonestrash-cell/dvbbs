import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ShowSettlement } from "@/lib/supabase/types";

export async function getSettlement(
  show_id: string,
): Promise<ShowSettlement | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_settlement")
    .select("*")
    .eq("show_id", show_id)
    .maybeSingle();
  return (data as ShowSettlement | null) ?? null;
}
