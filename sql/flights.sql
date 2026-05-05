-- Flights table. Manage every leg of every trip. Optionally tied to a show
-- so the tour list and the show detail can show flights in context.
--
-- Paste this in the Supabase SQL editor and run.

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  show_id uuid references public.shows(id) on delete set null,

  -- Identity
  passenger_name text not null,
  airline text not null,
  flight_number text,
  confirmation_code text,

  -- Schedule. Stored as timestamptz so we can reason in absolute time.
  -- The UI displays in the departure airport's local time.
  departure_airport text not null,        -- IATA code, e.g. LAX
  arrival_airport text not null,          -- IATA code, e.g. JFK
  departure_time timestamptz not null,
  arrival_time timestamptz not null,

  -- Comfort + cost
  cabin text not null default 'economy'
    check (cabin in ('economy', 'premium', 'business', 'first')),
  seat text,
  cost numeric,
  currency text default 'USD',

  -- Lifecycle
  status text not null default 'booked'
    check (status in ('booked', 'confirmed', 'checked_in', 'completed', 'cancelled')),

  ticket_url text,
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flights_show_id_idx on public.flights(show_id);
create index if not exists flights_departure_time_idx
  on public.flights(departure_time);

-- Auto-bump updated_at
create or replace function public.flights_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_flights_updated_at on public.flights;
create trigger trg_flights_updated_at
  before update on public.flights
  for each row execute function public.flights_set_updated_at();

-- RLS: matches the rest of the app. Authenticated members can do everything;
-- the public anon role can read+write while AUTH_DISABLED is on.
alter table public.flights enable row level security;

drop policy if exists "anon all flights" on public.flights;
create policy "anon all flights" on public.flights
  for all using (true) with check (true);
