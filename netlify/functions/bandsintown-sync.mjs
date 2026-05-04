// Netlify scheduled function: pulls Bandsintown events and inserts new ones
// as `lead` status. Runs daily. Configure via the schedule export below.
//
// Required env vars (set in Netlify dashboard):
//   NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   BANDSINTOWN_API_KEY
//   BANDSINTOWN_ARTIST_NAME (optional, defaults to DVBBS)

import { createClient } from "@supabase/supabase-js";

export const config = { schedule: "@daily" };

export default async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.BANDSINTOWN_API_KEY;
  const artist = process.env.BANDSINTOWN_ARTIST_NAME ?? "DVBBS";

  if (!url || !key) {
    return new Response("Missing Supabase env.", { status: 500 });
  }
  if (!apiKey) {
    return new Response("Missing BANDSINTOWN_API_KEY.", { status: 500 });
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const apiUrl = `https://rest.bandsintown.com/artists/${encodeURIComponent(artist)}/events?app_id=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(apiUrl, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    return new Response(`Bandsintown HTTP ${resp.status}`, { status: 502 });
  }

  const events = await resp.json();
  let inserted = 0;
  const errors = [];

  for (const ev of events) {
    const btId = String(ev.id);
    try {
      const existing = await sb
        .from("shows")
        .select("id")
        .eq("bandsintown_id", btId)
        .maybeSingle();
      if (existing.data) continue;

      const dt = ev.datetime ?? "";
      const show_date = dt.slice(0, 10) || null;
      const set_time = dt.slice(11, 16) || null;

      const { error } = await sb.from("shows").insert({
        bandsintown_id: btId,
        status: "lead",
        show_date,
        set_time,
        venue_name: ev.venue?.name ?? null,
        city: ev.venue?.city ?? null,
        country: ev.venue?.country ?? null,
        region: ev.venue?.region ?? null,
        timezone: ev.venue?.timezone ?? null,
      });
      if (error) errors.push(`${btId}: ${error.message}`);
      else inserted++;
    } catch (e) {
      errors.push(`${btId}: ${e?.message ?? String(e)}`);
    }
  }

  return Response.json({ ok: true, inserted, errors });
};
