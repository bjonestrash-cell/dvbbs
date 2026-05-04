import { NextResponse, type NextRequest } from "next/server";
import { requireMember } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ showId: string }> },
) {
  await requireMember();
  const { showId } = await params;

  const supabase = await createClient();
  const { data: settlement } = await supabase
    .from("show_settlement")
    .select("invoice_url")
    .eq("show_id", showId)
    .maybeSingle();

  const path =
    (settlement as { invoice_url: string | null } | null)?.invoice_url ?? null;
  if (!path) {
    return new NextResponse("No invoice on file.", { status: 404 });
  }

  const { data, error } = await supabase.storage
    .from("settlement-docs")
    .createSignedUrl(path, 60 * 30);

  if (error || !data?.signedUrl) {
    return new NextResponse("Could not generate signed URL.", { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl);
}
