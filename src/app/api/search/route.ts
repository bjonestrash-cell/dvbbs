import { NextResponse, type NextRequest } from "next/server";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { requireMember } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

export type SearchHit = {
  kind: "show" | "contact" | "nav";
  id: string;
  href: string;
  title: string;
  subtitle?: string;
  badge?: string;
};

const NAV_HITS: SearchHit[] = [
  { kind: "nav", id: "nav-tour", href: "/tour", title: "Tour, list" },
  { kind: "nav", id: "nav-tour-cal", href: "/tour/calendar", title: "Tour, calendar" },
  { kind: "nav", id: "nav-tour-new", href: "/tour/new", title: "New show" },
  { kind: "nav", id: "nav-contacts", href: "/contacts", title: "Contacts" },
  { kind: "nav", id: "nav-team", href: "/team", title: "Team" },
  { kind: "nav", id: "nav-settings", href: "/settings", title: "Settings" },
];

export async function GET(req: NextRequest) {
  if (!AUTH_DISABLED) {
    await requireMember();
  }
  const q = (req.nextUrl.searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ hits: NAV_HITS.slice(0, 5) });

  const term = `%${q.replace(/[%_]/g, "\\$&")}%`;
  const supabase = await createClient();

  const [showsRes, contactsRes] = await Promise.all([
    supabase
      .from("shows")
      .select("id, show_date, city, venue_name, status")
      .or(`city.ilike.${term},venue_name.ilike.${term}`)
      .order("show_date", { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from("contacts")
      .select("id, name, type, company, email")
      .or(`name.ilike.${term},company.ilike.${term},email.ilike.${term}`)
      .limit(8),
  ]);

  type ShowHit = {
    id: string;
    show_date: string | null;
    city: string | null;
    venue_name: string | null;
    status: string;
  };
  type ContactHit = {
    id: string;
    name: string;
    type: string;
    company: string | null;
    email: string | null;
  };

  const showHits: SearchHit[] = (
    (showsRes.data as ShowHit[] | null) ?? []
  ).map((s) => ({
    kind: "show",
    id: s.id,
    href: `/tour/${s.id}`,
    title: `${s.city ?? "TBD"}, ${s.venue_name ?? "TBD"}`,
    subtitle: s.show_date ?? "",
    badge: s.status,
  }));

  const contactHits: SearchHit[] = (
    (contactsRes.data as ContactHit[] | null) ?? []
  ).map((c) => ({
    kind: "contact",
    id: c.id,
    href: `/contacts/${c.id}`,
    title: c.name,
    subtitle: c.company ?? c.email ?? "",
    badge: c.type,
  }));

  const ql = q.toLowerCase();
  const navHits = NAV_HITS.filter((n) =>
    n.title.toLowerCase().includes(ql),
  ).slice(0, 4);

  return NextResponse.json({
    hits: [...showHits, ...contactHits, ...navHits],
  });
}
