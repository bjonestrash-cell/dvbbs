import { createClient } from "@supabase/supabase-js";

type SbClient = {
  from: (t: string) => {
    select: (s: string) => {
      eq: (k: string, v: string) => {
        maybeSingle: () => Promise<{ data: { id: string } | null }>;
      };
    };
    insert: (
      row: Record<string, unknown>,
    ) => Promise<{ error: { message: string } | null }>;
  };
};

type BTEvent = {
  id: string | number;
  datetime: string;
  venue: {
    name: string;
    city: string | null;
    country: string | null;
    region: string | null;
    timezone: string | null;
  };
};

export type SyncResult = {
  ok: boolean;
  inserted: number;
  updated: number;
  errors: string[];
  reason?: string;
};

export async function syncBandsintown(): Promise<SyncResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const apiKey = process.env.BANDSINTOWN_API_KEY;
  const artist = process.env.BANDSINTOWN_ARTIST_NAME ?? "DVBBS";

  if (!url || !serviceKey) {
    return {
      ok: false,
      inserted: 0,
      updated: 0,
      errors: [],
      reason: "Missing Supabase env.",
    };
  }
  if (!apiKey) {
    return {
      ok: false,
      inserted: 0,
      updated: 0,
      errors: [],
      reason: "Missing BANDSINTOWN_API_KEY.",
    };
  }

  const sb = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as SbClient;

  const apiUrl = `https://rest.bandsintown.com/artists/${encodeURIComponent(
    artist,
  )}/events?app_id=${encodeURIComponent(apiKey)}`;
  const resp = await fetch(apiUrl, {
    headers: { Accept: "application/json" },
  });
  if (!resp.ok) {
    return {
      ok: false,
      inserted: 0,
      updated: 0,
      errors: [],
      reason: `Bandsintown HTTP ${resp.status}`,
    };
  }
  const events = (await resp.json()) as BTEvent[];

  let inserted = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const ev of events) {
    const btId = String(ev.id);
    try {
      const existing = await sb
        .from("shows")
        .select("id")
        .eq("bandsintown_id", btId)
        .maybeSingle();

      if (existing.data) {
        // Already imported, leave alone (preserve manual edits).
        continue;
      }

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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`${btId}: ${msg}`);
    }
  }

  return { ok: true, inserted, updated, errors };
}
