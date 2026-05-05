"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const ReleaseStatusSchema = z.enum([
  "idea",
  "in_production",
  "mixing",
  "mastered",
  "delivered",
  "scheduled",
  "released",
  "archived",
]);

export async function setReleaseStatus(releaseId: string, status: string) {
  await requireRole("principal", "manager");
  const parsed = ReleaseStatusSchema.safeParse(status);
  if (!parsed.success) {
    return { ok: false as const, message: "Bad status." };
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("releases")
    .update({ status: parsed.data })
    .eq("id", releaseId);
  if (error) return { ok: false as const, message: error.message };
  revalidatePath("/releases");
  return { ok: true as const };
}
