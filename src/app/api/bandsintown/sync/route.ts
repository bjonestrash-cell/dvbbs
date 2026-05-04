import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/dal";
import { syncBandsintown } from "@/lib/integrations/bandsintown";

export async function POST() {
  await requireRole("principal");
  const result = await syncBandsintown();
  return NextResponse.json(result);
}
