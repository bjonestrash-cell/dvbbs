"use client";

import Link from "next/link";
import { useActionState, useMemo, useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, Loader2, Plane } from "lucide-react";
import { createFlight, type NewFlightState } from "../actions";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import {
  COMMON_AIRPORTS,
  FLIGHT_CABIN_LABEL,
  FLIGHT_CABIN_ORDER,
  FLIGHT_STATUS_LABEL,
  FLIGHT_STATUS_ORDER,
} from "@/lib/data/flights-shared";
import type { Show } from "@/lib/supabase/types";

const initial: NewFlightState = { status: "idle" };

// Best-guess airport for a show city. Used to pre-fill the arrival when
// the user attaches a show.
const CITY_TO_IATA: Record<string, string> = {
  "los angeles": "LAX",
  "new york": "JFK",
  brooklyn: "JFK",
  "las vegas": "LAS",
  miami: "MIA",
  chicago: "ORD",
  washington: "DCA",
  toronto: "YYZ",
  vancouver: "YVR",
  "mexico city": "MEX",
  ibiza: "IBZ",
  london: "LHR",
  paris: "CDG",
  amsterdam: "AMS",
  berlin: "BER",
  madrid: "MAD",
  barcelona: "BCN",
  rome: "FCO",
  milan: "MXP",
  vienna: "VIE",
  zurich: "ZRH",
  copenhagen: "CPH",
  stockholm: "ARN",
  oslo: "OSL",
  brussels: "BRU",
  boom: "BRU",
  dublin: "DUB",
  lisbon: "LIS",
  dubai: "DXB",
  doha: "DOH",
  singapore: "SIN",
  "hong kong": "HKG",
  tokyo: "HND",
  seoul: "ICN",
  bangkok: "BKK",
  bali: "DPS",
  sydney: "SYD",
  melbourne: "MEL",
  "sao paulo": "GRU",
  "buenos aires": "EZE",
};

function defaultDepartureFor(showDate: string | null | undefined): string {
  // Default to ~16h before set time, anchored at noon.
  if (!showDate) return "";
  const d = new Date(`${showDate}T12:00`);
  d.setDate(d.getDate() - 1);
  return toLocalIsoMinute(d);
}

function defaultArrivalFor(depIso: string): string {
  if (!depIso) return "";
  const d = new Date(depIso);
  d.setHours(d.getHours() + 6);
  return toLocalIsoMinute(d);
}

function toLocalIsoMinute(d: Date): string {
  // YYYY-MM-DDTHH:mm in local tz, suitable for `<input type="datetime-local">`.
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewFlightForm({ shows }: { shows: Show[] }) {
  const [state, action, pending] = useActionState(createFlight, initial);
  const [showId, setShowId] = useState<string>("");
  const [arrival, setArrival] = useState("");
  const [departure, setDeparture] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [cabin, setCabin] = useState<string>("economy");
  const [status, setStatus] = useState<string>("booked");

  const selectedShow = useMemo(
    () => shows.find((s) => s.id === showId) ?? null,
    [shows, showId],
  );

  // Smart-fill arrival airport + departure time when a show is picked.
  useEffect(() => {
    if (!selectedShow) return;
    const city = (selectedShow.city ?? "").toLowerCase().trim();
    const iata = CITY_TO_IATA[city];
    if (iata && !arrival) setArrival(iata);
    if (!departureTime && selectedShow.show_date) {
      const dep = defaultDepartureFor(selectedShow.show_date);
      setDepartureTime(dep);
      if (!arrivalTime) setArrivalTime(defaultArrivalFor(dep));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedShow]);

  // Auto-suggest arrival time when departure changes, if arrival empty.
  useEffect(() => {
    if (departureTime && !arrivalTime) {
      setArrivalTime(defaultArrivalFor(departureTime));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departureTime]);

  return (
    <form
      action={action}
      className="flex flex-col gap-6 px-6 md:px-10 py-6 md:py-8 max-w-3xl form-bottom-pad md:pb-10"
    >
      <datalist id="airport-list">
        {COMMON_AIRPORTS.map((a) => (
          <option key={a.iata} value={a.iata}>
            {`${a.iata} — ${a.label}`}
          </option>
        ))}
      </datalist>

      {/* From → To */}
      <Section title="Route" eyebrow="step 1">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
          <Field label="From" required error={state.errors?.departure_airport}>
            <input
              name="departure_airport"
              required
              value={departure}
              onChange={(e) => setDeparture(e.target.value.toUpperCase())}
              placeholder="LAX"
              autoCapitalize="characters"
              spellCheck={false}
              list="airport-list"
              maxLength={4}
              className="h-12 w-full border border-line bg-surface px-3 font-display text-[24px] tracking-[-0.02em] text-fg uppercase placeholder:text-fg-faint outline-none focus:border-line-strong num"
            />
          </Field>
          <div className="pb-3 flex items-center justify-center text-fg-faint">
            <Plane className="size-5" strokeWidth={1.5} aria-hidden />
          </div>
          <Field label="To" required error={state.errors?.arrival_airport}>
            <input
              name="arrival_airport"
              required
              value={arrival}
              onChange={(e) => setArrival(e.target.value.toUpperCase())}
              placeholder="JFK"
              autoCapitalize="characters"
              spellCheck={false}
              list="airport-list"
              maxLength={4}
              className="h-12 w-full border border-line bg-surface px-3 font-display text-[24px] tracking-[-0.02em] text-fg uppercase placeholder:text-fg-faint outline-none focus:border-line-strong num"
            />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Departs" required error={state.errors?.departure_time}>
            <input
              name="departure_time"
              type="datetime-local"
              required
              value={departureTime}
              onChange={(e) => setDepartureTime(e.target.value)}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Arrives" required error={state.errors?.arrival_time}>
            <input
              name="arrival_time"
              type="datetime-local"
              required
              value={arrivalTime}
              onChange={(e) => setArrivalTime(e.target.value)}
              className={fieldClass + " num"}
            />
          </Field>
        </div>
      </Section>

      {/* Flight identity */}
      <Section title="Flight" eyebrow="step 2">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Airline" required error={state.errors?.airline}>
            <input
              name="airline"
              required
              placeholder="Delta"
              className={fieldClass}
            />
          </Field>
          <Field label="Flight number">
            <input
              name="flight_number"
              placeholder="DL 0023"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Passenger" required error={state.errors?.passenger_name}>
            <input
              name="passenger_name"
              required
              defaultValue="Chris Chronicles"
              placeholder="Name on ticket"
              className={fieldClass}
            />
          </Field>
          <Field label="Confirmation code">
            <input
              name="confirmation_code"
              placeholder="ABC123"
              autoCapitalize="characters"
              spellCheck={false}
              className={fieldClass + " uppercase"}
            />
          </Field>
        </div>

        <Field label="Cabin">
          <input type="hidden" name="cabin" value={cabin} />
          <div className="flex flex-wrap gap-2">
            {FLIGHT_CABIN_ORDER.map((c) => (
              <ChipButton
                key={c}
                active={cabin === c}
                onClick={() => setCabin(c)}
              >
                {FLIGHT_CABIN_LABEL[c]}
              </ChipButton>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Seat">
            <input
              name="seat"
              placeholder="14A"
              autoCapitalize="characters"
              spellCheck={false}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Status">
            <input type="hidden" name="status" value={status} />
            <div className="flex flex-wrap gap-2">
              {FLIGHT_STATUS_ORDER.map((s) => (
                <ChipButton
                  key={s}
                  active={status === s}
                  onClick={() => setStatus(s)}
                >
                  {FLIGHT_STATUS_LABEL[s]}
                </ChipButton>
              ))}
            </div>
          </Field>
        </div>
      </Section>

      {/* Show + extras */}
      <Section title="Trip" eyebrow="step 3">
        <Field label="Attach to show">
          <select
            name="show_id"
            value={showId}
            onChange={(e) => setShowId(e.target.value)}
            className={fieldClass}
          >
            <option value="">No show</option>
            {shows.map((s) => (
              <option key={s.id} value={s.id}>
                {(s.show_date ?? "TBD")} · {s.city ?? "TBD"}
                {s.venue_name ? ` · ${s.venue_name}` : ""}
              </option>
            ))}
          </select>
          {selectedShow ? (
            <span className="mt-1 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-accent">
              Smart-fill
              <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
              <span className="text-fg-dim">
                Defaults departure ~24h before set time, fills arrival airport.
              </span>
            </span>
          ) : null}
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Cost">
            <input
              name="cost"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Currency">
            <select name="currency" defaultValue="USD" className={fieldClass}>
              {(["USD", "EUR", "GBP", "CAD", "JPY", "AUD"] as const).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Ticket URL">
          <input
            name="ticket_url"
            type="url"
            placeholder="https://"
            className={fieldClass}
          />
        </Field>

        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            placeholder="Lounge access, baggage allowance, transfer info..."
            className={textareaClass}
          />
        </Field>
      </Section>

      {state.status === "error" && state.message ? (
        <p className="font-sans text-[13px] text-cancelled">{state.message}</p>
      ) : null}

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className={buttonClasses({ variant: "primary", size: "lg" })}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Saving
            </>
          ) : (
            <>
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Save flight
            </>
          )}
        </button>
        <Link
          href="/flights"
          className={buttonClasses({ variant: "ghost", size: "lg" })}
        >
          <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
          Cancel
        </Link>
      </div>
    </form>
  );
}

const fieldClass =
  "h-10 w-full border border-line bg-surface px-3 font-sans text-[14px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

const textareaClass =
  "w-full border border-line bg-surface px-3 py-2 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong resize-y";

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-surface p-5 md:p-6">
      <header className="mb-4">
        <div className="marker">{eyebrow}</div>
        <h2 className="font-display text-[20px] text-fg mt-1">{title}</h2>
      </header>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  required,
  error,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error?.[0] ? (
        <span className="font-sans text-[12px] text-cancelled">{error[0]}</span>
      ) : null}
    </label>
  );
}

function ChipButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-10 md:h-9 inline-flex items-center px-4 rounded-full border font-mono uppercase tracking-[0.06em] text-[11px] [transition-duration:80ms]",
        active
          ? "bg-inverted text-fg-inverted border-inverted"
          : "bg-transparent border-line text-fg-dim hover:border-line-strong hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}
