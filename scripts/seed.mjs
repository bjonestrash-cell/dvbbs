// Dev-only seed script. Inserts sample shows and contacts using the service role client.
// Idempotent on bandsintown_id and contact email.
// Usage: pnpm seed

import { createClient } from "@supabase/supabase-js";
import { loadEnvConfig } from "@next/env";
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
    name: "Lukas Renner",
    company: "Tube Booking",
    email: "lukas@tube.de",
    city: "Munich",
    country: "DE",
    notes: "Prefers Saturday slots.",
  },
  {
    type: "promoter",
    name: "Emma Lefevre",
    company: "Insomniac Europe",
    email: "emma@insomniac.eu",
    city: "Amsterdam",
    country: "NL",
    notes: ".",
  },
  {
    type: "venue",
    name: "Hi Ibiza",
    company: "Hi Ibiza Group",
    email: "bookings@hiibiza.com",
    city: "Ibiza",
    country: "ES",
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
  ids.lukas = await ensureContact(contacts[0]);
  ids.emma = await ensureContact(contacts[1]);
  ids.hi = await ensureContact(contacts[2]);

  const shows = [
    {
      bandsintown_id: "seed-001",
      status: "confirmed",
      show_date: dateAt(14),
      doors_time: "22:00",
      set_time: "01:30",
      set_length_minutes: 75,
      timezone: "Europe/Amsterdam",
      venue_name: "Paradiso",
      city: "Amsterdam",
      country: "NL",
      region: "Europe",
      capacity: 1500,
      promoter_contact_id: ids.emma,
      fee_offered: 35000,
      fee_confirmed: 35000,
      currency: "EUR",
      deposit_received: 17500,
      travel_covered: true,
      hospitality_covered: true,
      notes: "Headline. Crew of 3.",
    },
    {
      bandsintown_id: "seed-002",
      status: "contracted",
      show_date: dateAt(45),
      set_time: "02:00",
      set_length_minutes: 90,
      timezone: "Europe/Madrid",
      venue_name: "Hi Ibiza",
      city: "Ibiza",
      country: "ES",
      region: "Europe",
      capacity: 4000,
      promoter_contact_id: ids.hi,
      fee_offered: 60000,
      fee_confirmed: 60000,
      currency: "EUR",
      travel_covered: true,
      hospitality_covered: true,
      notes: "Residency week 3.",
    },
    {
      bandsintown_id: "seed-003",
      status: "offered",
      show_date: dateAt(72),
      timezone: "Europe/Berlin",
      venue_name: "Watergate",
      city: "Berlin",
      country: "DE",
      region: "Europe",
      capacity: 600,
      promoter_contact_id: ids.lukas,
      fee_offered: 18000,
      currency: "EUR",
      notes: "Awaiting confirmation.",
    },
    {
      bandsintown_id: "seed-004",
      status: "holding",
      show_date: dateAt(90),
      timezone: "America/New_York",
      venue_name: "Brooklyn Mirage",
      city: "New York",
      country: "US",
      region: "North America",
      capacity: 6000,
      fee_offered: 80000,
      currency: "USD",
      notes: "Soft hold. Need answer by Mar 1.",
    },
    {
      bandsintown_id: "seed-005",
      status: "lead",
      show_date: dateAt(180),
      timezone: "Asia/Tokyo",
      venue_name: "Womb",
      city: "Tokyo",
      country: "JP",
      region: "Asia",
      capacity: 1200,
      fee_offered: 35000,
      currency: "USD",
      notes: "Initial outreach. Awaiting promoter availability.",
    },
    {
      bandsintown_id: "seed-006",
      status: "completed",
      show_date: dateAt(-21),
      timezone: "Europe/London",
      venue_name: "Printworks",
      city: "London",
      country: "GB",
      region: "Europe",
      capacity: 2500,
      fee_offered: 40000,
      fee_confirmed: 40000,
      currency: "GBP",
      notes: "Sold out. Settlement pending.",
    },
  ];

  for (const s of shows) await ensureShow(s);

  console.log("done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
