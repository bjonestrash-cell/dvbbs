import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const platform = req.nextUrl.searchParams.get("p");
  if (!platform) {
    return NextResponse.redirect(new URL(`/link/${slug}`, req.url));
  }

  const supabase = await createClient();
  const { data: link } = await supabase
    .from("smart_links")
    .select("id, destinations, click_count")
    .eq("slug", slug)
    .maybeSingle();

  type Row = {
    id: string;
    destinations: Record<string, string>;
    click_count: number;
  };
  const row = (link as Row | null) ?? null;
  if (!row) {
    return new NextResponse("Not found.", { status: 404 });
  }

  const target = row.destinations?.[platform];
  if (!target) {
    return NextResponse.redirect(new URL(`/link/${slug}`, req.url));
  }

  const country =
    req.headers.get("x-vercel-ip-country") ??
    req.headers.get("cf-ipcountry") ??
    req.headers.get("x-country") ??
    null;
  const userAgent = req.headers.get("user-agent");

  // Best-effort logging. Don't block the redirect on failures.
  await Promise.allSettled([
    supabase.from("smart_link_clicks").insert({
      smart_link_id: row.id,
      platform,
      country,
      user_agent: userAgent,
    }),
    supabase
      .from("smart_links")
      .update({ click_count: (row.click_count ?? 0) + 1 })
      .eq("id", row.id),
  ]);

  return NextResponse.redirect(target);
}
