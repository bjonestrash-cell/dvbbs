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

  console.log("done.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
