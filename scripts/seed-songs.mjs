// One-time seed for the Releases kanban. Inserts all songs from the
// brief, idempotent on slug. Uses the Supabase service role key.
//
// Usage: node scripts/seed-songs.mjs
//
// Schema: public.releases (see src/lib/supabase/types.ts).
//   - title (text, required)
//   - slug (text, unique)
//   - type (single | ep | album | remix | edit | bootleg)
//   - status (idea | in_production | mixing | mastered | delivered |
//             scheduled | released | archived)
//   - collaborators (text[])
//   - notes (text)
//
// Album tracks land as `single` with notes flagging them as part of the
// upcoming DVBBS album. The schema has no album_project column, so notes
// is the carrier per the brief.

import { createClient } from "@supabase/supabase-js";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import { fileURLToPath } from "node:url";
import path from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
loadEnvConfig(path.join(__dirname, ".."));

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing Supabase env vars.");
  process.exit(1);
}

const sb = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Mirrors the slugify in src/lib/data/releases.ts.
function slugify(input) {
  return input
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const ALBUM_TAG = "DVBBS Album - Our Vocals";

/** Build a release row from minimal song info. */
function row({ title, status, collaborators = [], album = false, notes = "" }) {
  const finalNotes = album
    ? notes
      ? `${ALBUM_TAG}. ${notes}`
      : ALBUM_TAG
    : notes || null;
  return {
    title,
    slug: slugify(title),
    type: "single",
    status,
    collaborators: collaborators.length ? collaborators : null,
    notes: finalNotes,
  };
}

const songs = [
  // IDEA -----------------------------------------------------------
  row({ title: "Mexican song (Eddie)", status: "idea", collaborators: ["Eddie"] }),
  row({ title: "Like This", status: "idea" }),
  row({ title: "Tonight", status: "idea" }),
  row({ title: "Corners Of My Mind", status: "idea" }),
  row({ title: "Dancing With Your Ghost", status: "idea" }),
  row({ title: "Temple", status: "idea" }),
  row({ title: "Into The Wild", status: "idea" }),
  row({ title: "Jahlana", status: "idea" }),
  row({ title: "Shelter", status: "idea" }),
  row({ title: "Sex Symbol", status: "idea" }),
  row({ title: "Unspoken Tension", status: "idea" }),
  row({ title: "Satelite", status: "idea" }),
  row({
    title: "DVBBS x Nate Band",
    status: "idea",
    collaborators: ["Nate Band"],
  }),

  // IN PRODUCTION --------------------------------------------------
  row({ title: "Say Yeah", status: "in_production" }),
  row({ title: "Torture Of The Heart", status: "in_production" }),
  row({ title: "One Night", status: "in_production" }),
  row({ title: "PLAYGROUND", status: "in_production" }),
  row({ title: "Summertime Touch", status: "in_production" }),
  row({ title: "Runaway", status: "in_production" }),
  row({ title: "Want Me Back", status: "in_production" }),
  row({ title: "Right Here", status: "in_production" }),
  row({ title: "Shapes", status: "in_production" }),
  row({ title: "Find You", status: "in_production" }),
  row({ title: "Sirens", status: "in_production" }),
  row({ title: "Heaven", status: "in_production" }),
  row({ title: "Love Side", status: "in_production" }),

  // RELEASED -------------------------------------------------------
  row({ title: "Rockstar", status: "released" }),
  row({ title: "Like An 808", status: "released" }),
  row({ title: "Love Me Better", status: "released" }),

  // DVBBS ALBUM (album-bound, idea status per brief) ---------------
  row({ title: "Worries", status: "idea", album: true }),
  row({ title: "Dreamers", status: "idea", album: true }),
  row({ title: "High", status: "idea", album: true }),
  row({ title: "Dreamin", status: "idea", album: true }),
  row({ title: "Lonely", status: "idea", album: true }),
  row({ title: "Touch the Sky", status: "idea", album: true }),
  row({ title: "Night Moves", status: "idea", album: true }),
];

(async () => {
  // Sanity: confirm the table exists before we do anything.
  const probe = await sb.from("releases").select("id", { count: "exact", head: true });
  if (probe.error) {
    console.error("Cannot read releases table:", probe.error.message);
    process.exit(1);
  }

  let inserted = 0;
  let skipped = 0;
  for (const r of songs) {
    const existing = await sb
      .from("releases")
      .select("id")
      .eq("slug", r.slug)
      .maybeSingle();
    if (existing.data?.id) {
      skipped++;
      console.log("skip existing", r.slug);
      continue;
    }
    const { error } = await sb.from("releases").insert(r);
    if (error) {
      console.error("insert failed", r.slug, error.message);
      continue;
    }
    inserted++;
    console.log("inserted", r.status, r.slug);
  }

  // Final row count for confirmation.
  const after = await sb
    .from("releases")
    .select("id", { count: "exact", head: true });
  if (after.error) {
    console.error("final count failed:", after.error.message);
    process.exit(1);
  }

  console.log("");
  console.log(`inserted: ${inserted}`);
  console.log(`skipped:  ${skipped}`);
  console.log(`total releases rows: ${after.count}`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
