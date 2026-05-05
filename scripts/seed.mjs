// Dev-only seed script. Inserts sample shows and contacts using the service role client.
// Idempotent on bandsintown_id and contact email.
// Usage: pnpm seed

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

const today = new Date();
function dateAt(daysFromNow) {
  const d = new Date(today);
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

const contacts = [
  {
    type: "promoter",
    name: "Pasquale Rotella",
    company: "Insomniac Events",
    email: "bookings@insomniac.com",
    city: "Los Angeles",
    country: "US",
    notes: "EDC, Hard Summer, Beyond Wonderland.",
  },
  {
    type: "promoter",
    name: "Jurgen Grebner",
    company: "Avant Gardner",
    email: "jurgen@avantgardner.com",
    city: "New York",
    country: "US",
    notes: "Brooklyn Mirage, Kings Hall, Great Hall.",
  },
  {
    type: "promoter",
    name: "Manu Yanes",
    company: "Hi Ibiza",
    email: "manu@hiibiza.com",
    city: "Ibiza",
    country: "ES",
  },
  {
    type: "promoter",
    name: "Tomas Sanchez",
    company: "Tao Group Hospitality",
    email: "bookings@taogroup.com",
    city: "Las Vegas",
    country: "US",
    notes: "Marquee Dayclub, Tao Beach, Lavo.",
  },
  {
    type: "promoter",
    name: "Pieter De Decker",
    company: "Tomorrowland",
    email: "booking@tomorrowland.com",
    city: "Boom",
    country: "BE",
  },
  {
    type: "agent",
    name: "Ash Lewis",
    company: "WME",
    email: "alewis@wmeagency.com",
    city: "Beverly Hills",
    country: "US",
    notes: "Booking agent, North America + Europe.",
  },
  {
    type: "venue",
    name: "Echostage",
    company: "Club Glow",
    email: "info@echostage.com",
    city: "Washington",
    country: "US",
  },
];

async function ensureContact(c) {
  const existing = await sb
    .from("contacts")
    .select("id")
    .eq("email", c.email)
    .maybeSingle();
  if (existing.data?.id) return existing.data.id;
  const { data, error } = await sb
    .from("contacts")
    .insert(c)
    .select("id")
    .single();
  if (error) {
    console.error("Failed to insert contact", c.email, error.message);
    process.exit(1);
  }
  return data.id;
}

async function ensureShow(payload) {
  const existing = await sb
    .from("shows")
    .select("id")
    .eq("bandsintown_id", payload.bandsintown_id)
    .maybeSingle();
  if (existing.data?.id) {
    console.log("skip existing", payload.city);
    return existing.data.id;
  }
  const { data, error } = await sb
    .from("shows")
    .insert(payload)
    .select("id")
    .single();
  if (error) {
    console.error("Failed to insert show", payload.city, error.message);
    process.exit(1);
  }
  console.log("inserted", payload.status, payload.city, payload.show_date);
  return data.id;
}

(async () => {
  const ids = {};
  ids.insomniac = await ensureContact(contacts[0]);
  ids.avant = await ensureContact(contacts[1]);
  ids.hi = await ensureContact(contacts[2]);
  ids.tao = await ensureContact(contacts[3]);
  ids.tml = await ensureContact(contacts[4]);
  ids.wme = await ensureContact(contacts[5]);
  ids.echo = await ensureContact(contacts[6]);

  const shows = [
    {
      bandsintown_id: "seed-001",
      status: "confirmed",
      show_date: dateAt(14),
      doors_time: "21:00",
      set_time: "23:30",
      set_length_minutes: 90,
      timezone: "America/New_York",
      venue_name: "Echostage",
      city: "Washington",
      country: "US",
      region: "North America",
      capacity: 3000,
      promoter_contact_id: ids.echo,
      agent_contact_id: ids.wme,
      fee_offered: 40000,
      fee_confirmed: 40000,
      currency: "USD",
      deposit_received: 20000,
      travel_covered: true,
      hospitality_covered: true,
      notes: "Headline. Crew of 3, hotel comped.",
    },
    {
      bandsintown_id: "seed-002",
      status: "contracted",
      show_date: dateAt(45),
      doors_time: "23:00",
      set_time: "02:00",
      set_length_minutes: 90,
      timezone: "Europe/Madrid",
      venue_name: "Hi Ibiza",
      city: "Ibiza",
      country: "ES",
      region: "Europe",
      capacity: 5000,
      promoter_contact_id: ids.hi,
      agent_contact_id: ids.wme,
      fee_offered: 65000,
      fee_confirmed: 60000,
      currency: "EUR",
      deposit_received: 30000,
      travel_covered: true,
      hospitality_covered: true,
      notes: "Closing season residency week.",
    },
    {
      bandsintown_id: "seed-003",
      status: "offered",
      show_date: dateAt(72),
      timezone: "America/New_York",
      venue_name: "Brooklyn Mirage",
      city: "New York",
      country: "US",
      region: "North America",
      capacity: 6000,
      promoter_contact_id: ids.avant,
      agent_contact_id: ids.wme,
      fee_offered: 50000,
      currency: "USD",
      notes: "Awaiting promoter sign-off on the offer.",
    },
    {
      bandsintown_id: "seed-004",
      status: "holding",
      show_date: dateAt(90),
      timezone: "America/Los_Angeles",
      venue_name: "Marquee Dayclub",
      city: "Las Vegas",
      country: "US",
      region: "North America",
      capacity: 2500,
      promoter_contact_id: ids.tao,
      agent_contact_id: ids.wme,
      fee_offered: 35000,
      currency: "USD",
      notes: "Soft hold. Need final answer by next month.",
    },
    {
      bandsintown_id: "seed-005",
      status: "lead",
      show_date: dateAt(180),
      timezone: "Europe/Brussels",
      venue_name: "Tomorrowland Mainstage",
      city: "Boom",
      country: "BE",
      region: "Europe",
      capacity: 90000,
      promoter_contact_id: ids.tml,
      agent_contact_id: ids.wme,
      fee_offered: 100000,
      currency: "EUR",
      notes: "Initial outreach for 2026 weekend 2.",
    },
    {
      bandsintown_id: "seed-006",
      status: "completed",
      show_date: dateAt(-19),
      timezone: "America/Los_Angeles",
      venue_name: "Hard Summer",
      city: "Los Angeles",
      country: "US",
      region: "North America",
      capacity: 50000,
      promoter_contact_id: ids.insomniac,
      agent_contact_id: ids.wme,
      fee_offered: 45000,
      fee_confirmed: 45000,
      currency: "USD",
      deposit_received: 22500,
      travel_covered: true,
      hospitality_covered: true,
      notes: "Sold out. Settlement pending review.",
    },
    {
      bandsintown_id: "seed-007",
      status: "completed",
      show_date: dateAt(-46),
      timezone: "Europe/London",
      venue_name: "Printworks",
      city: "London",
      country: "GB",
      region: "Europe",
      capacity: 2500,
      promoter_contact_id: ids.wme,
      agent_contact_id: ids.wme,
      fee_offered: 38000,
      fee_confirmed: 38000,
      currency: "GBP",
      deposit_received: 19000,
      travel_covered: true,
      hospitality_covered: true,
      notes: "Settlement closed. Paid in full.",
    },
  ];

  for (const s of shows) await ensureShow(s);

  // Releases (Phase 2 schema must be applied; warn and skip if missing).
  const releases = [
    {
      title: "Tsunami",
      slug: "tsunami",
      type: "single",
      status: "released",
      release_date: "2013-08-12",
      label: "Spinnin' Records",
      collaborators: ["Borgeous"],
      spotify_url: "https://open.spotify.com/track/0oXFrdT2EHlxfZRq8GjKKR",
      notes: "Breakout single, certified gold across multiple territories.",
    },
    {
      title: "Not Going Home",
      slug: "not-going-home",
      type: "single",
      status: "released",
      release_date: "2015-04-13",
      label: "Doorn Records",
      collaborators: ["CMC$"],
      spotify_url: "https://open.spotify.com/track/2lVxIrInkVyB75LoRksAEW",
      notes: "Festival anthem.",
    },
    {
      title: "Roadtrip",
      slug: "roadtrip",
      type: "single",
      status: "scheduled",
      release_date: dateAt(35),
      label: "Big Beat Records",
      collaborators: ["A-Trak"],
      notes: "Lead single off the upcoming EP. Pre-save campaign live.",
    },
    {
      title: "Untitled, working title Sunset",
      slug: "sunset-wip",
      type: "single",
      status: "mixing",
      label: null,
      collaborators: ["Tinashe"],
      notes: "Vocal stems delivered. Mixing with Sean Divine this week.",
    },
    {
      title: "Tsunami, 2026 VIP",
      slug: "tsunami-vip",
      type: "remix",
      status: "in_production",
      collaborators: [],
      notes: "Anniversary VIP edit for the Tomorrowland mainstage drop.",
    },
    {
      title: "Roadtrip Vol. 2 EP",
      slug: "roadtrip-vol-2-ep",
      type: "ep",
      status: "idea",
      collaborators: ["A-Trak", "Borgeous"],
      notes: "Five-track follow-up. Tracklist tentative.",
    },
  ];

  let releasesOk = true;
  for (const r of releases) {
    const existing = await sb
      .from("releases")
      .select("id")
      .eq("slug", r.slug)
      .maybeSingle();
    if (existing.error) {
      console.warn(
        "skipping releases seed, table not found:",
        existing.error.message,
      );
      releasesOk = false;
      break;
    }
    if (existing.data?.id) {
      console.log("skip existing release", r.slug);
      continue;
    }
    const { error } = await sb.from("releases").insert(r);
    if (error) {
      console.error("Failed to insert release", r.slug, error.message);
    } else {
      console.log("inserted release", r.status, r.title);
    }
  }

  if (releasesOk) {
    // Sample assets and marketing rows on the scheduled release.
    const { data: scheduled } = await sb
      .from("releases")
      .select("id")
      .eq("slug", "roadtrip")
      .maybeSingle();
    const releaseId = scheduled?.id;

    if (releaseId) {
      const assets = [
        { asset_type: "master_wav", status: "approved" },
        { asset_type: "instrumental", status: "approved" },
        { asset_type: "stems", status: "final" },
        { asset_type: "radio_edit", status: "in_progress", due_date: dateAt(7) },
        { asset_type: "cover_art", status: "approved" },
        { asset_type: "press_shot", status: "review" },
        { asset_type: "music_video", status: "in_progress", due_date: dateAt(20) },
        { asset_type: "press_release", status: "not_started", due_date: dateAt(14) },
        { asset_type: "splits_doc", status: "approved" },
      ];
      for (const a of assets) {
        const { count } = await sb
          .from("release_assets")
          .select("id", { count: "exact", head: true })
          .eq("release_id", releaseId)
          .eq("asset_type", a.asset_type);
        if ((count ?? 0) > 0) continue;
        await sb.from("release_assets").insert({ release_id: releaseId, ...a });
      }
      console.log("seeded assets for", "roadtrip");

      const tasks = [
        { channel: "instagram", task: "Reel teaser, 15s drop preview", status: "in_progress", scheduled_for: dateAt(10) },
        { channel: "tiktok", task: "Sound creator partnership, 3 creators", status: "todo", scheduled_for: dateAt(14) },
        { channel: "dsp_pitch", task: "Spotify editorial pitch, mint-Pop and Front Left", status: "in_progress", scheduled_for: dateAt(21) },
        { channel: "press", task: "Billboard premiere, exclusive interview", status: "todo", scheduled_for: dateAt(28) },
        { channel: "newsletter", task: "Pre-save email blast", status: "done", scheduled_for: dateAt(-2) },
        { channel: "youtube", task: "Lyric video upload + premiere", status: "todo", scheduled_for: dateAt(35) },
      ];
      for (const t of tasks) {
        const { count } = await sb
          .from("release_marketing")
          .select("id", { count: "exact", head: true })
          .eq("release_id", releaseId)
          .eq("task", t.task);
        if ((count ?? 0) > 0) continue;
        await sb.from("release_marketing").insert({ release_id: releaseId, ...t });
      }
      console.log("seeded marketing tasks for", "roadtrip");

      // Smart link for the scheduled release.
      const linkSlug = "roadtrip";
      const existingLink = await sb
        .from("smart_links")
        .select("id")
        .eq("slug", linkSlug)
        .maybeSingle();
      if (existingLink.error) {
        console.warn(
          "smart link seed skipped, table not found:",
          existingLink.error.message,
        );
      } else if (!existingLink.data) {
        const { error: linkErr } = await sb.from("smart_links").insert({
          slug: linkSlug,
          release_id: releaseId,
          title: "Roadtrip, with A-Trak",
          destinations: {
            spotify: "https://open.spotify.com/artist/3sl1tH2T0Eaom1AHL94VY7",
            apple: "https://music.apple.com/us/artist/dvbbs/580391984",
            soundcloud: "https://soundcloud.com/dvbbs",
            youtube: "https://www.youtube.com/@DVBBS",
            beatport: "https://www.beatport.com/artist/dvbbs/308432",
          },
          click_count: 0,
        });
        if (linkErr) {
          console.warn("smart link seed failed:", linkErr.message);
        } else {
          console.log("seeded smart link /link/" + linkSlug);
        }
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Phase 3 Merch seed (table must exist; warns and skips if missing).
  // ---------------------------------------------------------------------------
  const tomorrowlandShow = await sb
    .from("shows")
    .select("id")
    .eq("bandsintown_id", "seed-005")
    .maybeSingle();
  const hardSummerShow = await sb
    .from("shows")
    .select("id")
    .eq("bandsintown_id", "seed-006")
    .maybeSingle();
  const printworksShow = await sb
    .from("shows")
    .select("id")
    .eq("bandsintown_id", "seed-007")
    .maybeSingle();

  const merchProducts = [
    {
      name: "DVBBS Logo Tee",
      sku: "DVBBS-TEE-BLK",
      category: "Apparel",
      price: 35,
      cost_per_unit: 11.5,
      status: "active",
      is_tour_exclusive: false,
      notes:
        "Black 100% cotton tee with embroidered chevron logo. Heavyweight 240gsm.",
      variants: [
        { variant: "S", units_on_hand: 15, reorder_threshold: 8 },
        { variant: "M", units_on_hand: 8, reorder_threshold: 12 },
        { variant: "L", units_on_hand: 5, reorder_threshold: 12 },
        { variant: "XL", units_on_hand: 3, reorder_threshold: 8 },
      ],
    },
    {
      name: "Tsunami Hoodie",
      sku: "DVBBS-HOOD-CRM",
      category: "Apparel",
      price: 75,
      cost_per_unit: 28.5,
      status: "active",
      is_tour_exclusive: false,
      notes: "Cream pullover, oversized fit. Tsunami artwork on the back.",
      variants: [
        { variant: "M", units_on_hand: 22, reorder_threshold: 10 },
        { variant: "L", units_on_hand: 18, reorder_threshold: 10 },
        { variant: "XL", units_on_hand: 12, reorder_threshold: 8 },
      ],
    },
    {
      name: "Roadtrip Snapback",
      sku: "DVBBS-CAP-BLK",
      category: "Accessories",
      price: 40,
      cost_per_unit: 9.0,
      status: "active",
      is_tour_exclusive: false,
      notes: "Black six-panel snapback. Embroidered chevron front.",
      variants: [
        { variant: "OS", units_on_hand: 48, reorder_threshold: 20 },
      ],
    },
    {
      name: "Tsunami 12 inch Vinyl",
      sku: "DVBBS-VIN-TSU",
      category: "Vinyl",
      price: 25,
      cost_per_unit: 7.0,
      status: "active",
      is_tour_exclusive: false,
      notes:
        "Limited 1,000-press translucent blue vinyl. Tsunami / Pyramids double A-side.",
      variants: [
        { variant: "OS", units_on_hand: 78, reorder_threshold: 30 },
      ],
    },
    {
      name: "Tour Crewneck 2026",
      sku: "DVBBS-CREW-OLV",
      category: "Apparel",
      price: 65,
      cost_per_unit: 22,
      status: "active",
      is_tour_exclusive: false,
      notes: "Olive heavyweight crewneck with tour route on the back.",
      variants: [
        { variant: "M", units_on_hand: 30, reorder_threshold: 15 },
        { variant: "L", units_on_hand: 25, reorder_threshold: 15 },
        { variant: "XL", units_on_hand: 15, reorder_threshold: 8 },
      ],
    },
    tomorrowlandShow.data?.id
      ? {
          name: "Tomorrowland Mainstage Tee",
          sku: "DVBBS-TML-26",
          category: "Apparel",
          price: 45,
          cost_per_unit: 12.0,
          status: "active",
          is_tour_exclusive: true,
          exclusive_show_id: tomorrowlandShow.data.id,
          notes: "Limited tour-exclusive tee for Tomorrowland mainstage 2026.",
          variants: [
            { variant: "S", units_on_hand: 180, reorder_threshold: 50 },
            { variant: "M", units_on_hand: 240, reorder_threshold: 60 },
            { variant: "L", units_on_hand: 200, reorder_threshold: 60 },
            { variant: "XL", units_on_hand: 90, reorder_threshold: 40 },
          ],
        }
      : null,
    {
      name: "Heritage Tote Bag",
      sku: "DVBBS-TOTE",
      category: "Accessories",
      price: 22,
      cost_per_unit: 5.5,
      status: "active",
      is_tour_exclusive: false,
      notes: "Natural canvas tote with screen-printed chevron mark.",
      variants: [
        { variant: "OS", units_on_hand: 42, reorder_threshold: 20 },
      ],
    },
  ].filter(Boolean);

  let merchOk = true;
  const productIds = {};
  for (const p of merchProducts) {
    const existing = await sb
      .from("merch_products")
      .select("id")
      .eq("sku", p.sku)
      .maybeSingle();
    if (existing.error) {
      console.warn(
        "skipping merch seed, table not found:",
        existing.error.message,
      );
      merchOk = false;
      break;
    }
    if (existing.data?.id) {
      productIds[p.sku] = existing.data.id;
      console.log("skip existing merch", p.sku);
      continue;
    }
    const { variants, ...productRow } = p;
    const { data, error } = await sb
      .from("merch_products")
      .insert(productRow)
      .select("id")
      .single();
    if (error) {
      console.error("merch insert failed", p.sku, error.message);
      continue;
    }
    productIds[p.sku] = data.id;
    console.log("inserted merch", p.sku);
    for (const v of variants) {
      const { error: invErr } = await sb
        .from("merch_inventory")
        .insert({ product_id: data.id, ...v });
      if (invErr) console.warn("inventory insert", p.sku, v.variant, invErr.message);
    }
  }

  if (merchOk) {
    // Sample sales to populate /merch/sales
    const tee = productIds["DVBBS-TEE-BLK"];
    const hood = productIds["DVBBS-HOOD-CRM"];
    const cap = productIds["DVBBS-CAP-BLK"];
    const vinyl = productIds["DVBBS-VIN-TSU"];
    const crew = productIds["DVBBS-CREW-OLV"];
    const tote = productIds["DVBBS-TOTE"];
    const hardSummerId = hardSummerShow.data?.id ?? null;
    const printworksId = printworksShow.data?.id ?? null;

    const sales = [
      // Hard Summer LA, ~19 days ago, tour sales
      tee && {
        product_id: tee,
        variant: "M",
        show_id: hardSummerId,
        units_sold: 18,
        gross: 630,
        source: "tour",
        sale_date: dateAt(-19),
      },
      tee && {
        product_id: tee,
        variant: "L",
        show_id: hardSummerId,
        units_sold: 12,
        gross: 420,
        source: "tour",
        sale_date: dateAt(-19),
      },
      hood && {
        product_id: hood,
        variant: "L",
        show_id: hardSummerId,
        units_sold: 7,
        gross: 525,
        source: "tour",
        sale_date: dateAt(-19),
      },
      cap && {
        product_id: cap,
        variant: "OS",
        show_id: hardSummerId,
        units_sold: 14,
        gross: 560,
        source: "tour",
        sale_date: dateAt(-19),
      },
      // Printworks London, ~46 days ago, tour sales
      tee && {
        product_id: tee,
        variant: "M",
        show_id: printworksId,
        units_sold: 10,
        gross: 350,
        source: "tour",
        sale_date: dateAt(-46),
      },
      hood && {
        product_id: hood,
        variant: "M",
        show_id: printworksId,
        units_sold: 5,
        gross: 375,
        source: "tour",
        sale_date: dateAt(-46),
      },
      cap && {
        product_id: cap,
        variant: "OS",
        show_id: printworksId,
        units_sold: 8,
        gross: 320,
        source: "tour",
        sale_date: dateAt(-46),
      },
      // Shopify trickle, last 30 days
      tee && {
        product_id: tee,
        variant: "S",
        units_sold: 6,
        gross: 210,
        source: "shopify",
        sale_date: dateAt(-2),
      },
      hood && {
        product_id: hood,
        variant: "L",
        units_sold: 3,
        gross: 225,
        source: "shopify",
        sale_date: dateAt(-7),
      },
      vinyl && {
        product_id: vinyl,
        variant: "OS",
        units_sold: 11,
        gross: 275,
        source: "shopify",
        sale_date: dateAt(-12),
      },
      crew && {
        product_id: crew,
        variant: "L",
        units_sold: 4,
        gross: 260,
        source: "shopify",
        sale_date: dateAt(-22),
      },
      tote && {
        product_id: tote,
        variant: "OS",
        units_sold: 9,
        gross: 198,
        source: "shopify",
        sale_date: dateAt(-30),
      },
      // Older trickle for trend
      tee && {
        product_id: tee,
        variant: "M",
        units_sold: 8,
        gross: 280,
        source: "shopify",
        sale_date: dateAt(-58),
      },
      hood && {
        product_id: hood,
        variant: "M",
        units_sold: 4,
        gross: 300,
        source: "shopify",
        sale_date: dateAt(-72),
      },
      vinyl && {
        product_id: vinyl,
        variant: "OS",
        units_sold: 6,
        gross: 150,
        source: "shopify",
        sale_date: dateAt(-90),
      },
      tee && {
        product_id: tee,
        variant: "L",
        units_sold: 5,
        gross: 175,
        source: "shopify",
        sale_date: dateAt(-110),
      },
      crew && {
        product_id: crew,
        variant: "M",
        units_sold: 3,
        gross: 195,
        source: "wholesale",
        sale_date: dateAt(-150),
      },
    ].filter(Boolean);

    let inserted = 0;
    for (const s of sales) {
      const { error } = await sb.from("merch_sales").insert(s);
      if (error) {
        console.warn("merch sale insert", error.message);
        break;
      }
      inserted++;
    }
    if (inserted > 0) console.log(`seeded ${inserted} merch sales`);
  }

  console.log("done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
