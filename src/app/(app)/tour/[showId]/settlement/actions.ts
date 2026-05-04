"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole, getCurrentMember } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { logShowActivity } from "@/lib/data/activity";

const NumberOrEmpty = z.union([z.literal(""), z.coerce.number().nonnegative()]);

const SettlementSchema = z.object({
  gross_paid: NumberOrEmpty.optional(),
  expenses_total: NumberOrEmpty.optional(),
  agent_commission: NumberOrEmpty.optional(),
  manager_commission: NumberOrEmpty.optional(),
  paid_in_full: z.union([z.literal("on"), z.literal("")]).optional(),
  paid_date: z.string().optional().or(z.literal("")),
  invoice_url: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(8000).optional().or(z.literal("")),
});

export type SettlementState = {
  status: "idle" | "ok" | "error";
  message?: string;
};
export const initialSettlementState: SettlementState = { status: "idle" };

function num(v: number | "" | undefined): number | null {
  if (v === "" || v === undefined) return null;
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export async function saveSettlement(
  showId: string,
  _prev: SettlementState,
  formData: FormData,
): Promise<SettlementState> {
  await requireRole("principal", "accountant");

  const parsed = SettlementSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "error", message: "Validation failed." };
  }
  const v = parsed.data;
  const member = await getCurrentMember();

  const gross = num(v.gross_paid) ?? 0;
  const expenses = num(v.expenses_total) ?? 0;
  const agent = num(v.agent_commission) ?? 0;
  const manager = num(v.manager_commission) ?? 0;
  const net = gross - expenses - agent - manager;

  const supabase = await createClient();
  const upsert = {
    show_id: showId,
    gross_paid: num(v.gross_paid),
    expenses_total: num(v.expenses_total),
    agent_commission: num(v.agent_commission),
    manager_commission: num(v.manager_commission),
    net_to_artist: gross || expenses || agent || manager ? net : null,
    paid_in_full: v.paid_in_full === "on",
    paid_date: v.paid_date || null,
    invoice_url: v.invoice_url || null,
    notes: v.notes || null,
    reconciled_at: new Date().toISOString(),
    reconciled_by: member?.id ?? null,
  };

  const { error } = await supabase
    .from("show_settlement")
    .upsert(upsert, { onConflict: "show_id" });

  if (error) return { status: "error", message: error.message };

  await logShowActivity(showId, "settlement.saved", {
    net_to_artist: net,
    paid_in_full: upsert.paid_in_full,
  });
  revalidatePath(`/tour/${showId}`);
  revalidatePath(`/tour/${showId}/settlement`);
  return { status: "ok" };
}

export async function setSettlementLock(showId: string, locked: boolean) {
  await requireRole("principal");
  const supabase = await createClient();
  const { error } = await supabase
    .from("show_settlement")
    .update({ locked })
    .eq("show_id", showId);
  if (error) return { ok: false as const, message: error.message };
  await logShowActivity(
    showId,
    locked ? "settlement.locked" : "settlement.unlocked",
    null,
  );
  revalidatePath(`/tour/${showId}/settlement`);
  return { ok: true as const };
}
