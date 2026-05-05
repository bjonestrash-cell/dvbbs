import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import { getContact, listShowsForContact } from "@/lib/data/contacts";
import { CONTACT_TYPE_LABEL } from "@/lib/data/contacts-shared";
import {
  formatCapacity,
  formatDate,
  formatMoney,
} from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const c = await getContact(contactId);
  if (!c) return { title: "Contact. DVBBS HQ" };
  return { title: `${c.name}. DVBBS HQ` };
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

const STATUS_LABEL: Record<string, string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ contactId: string }>;
}) {
  const { contactId } = await params;
  const c = await getContact(contactId);
  if (!c) notFound();
  const shows = await listShowsForContact(c.id);

  return (
    <>
      <PageHeader
        eyebrow="Rolodex"
        title={titleCase(c.name)}
        description={
          c.company
            ? `${titleCase(c.company)} · ${CONTACT_TYPE_LABEL[c.type]}`
            : CONTACT_TYPE_LABEL[c.type]
        }
        actions={
          <Link
            href="/contacts"
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" strokeWidth={1.5} aria-hidden />
            All contacts
          </Link>
        }
      />

      <div className="px-6 md:px-10 py-8 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <section className="border border-line bg-surface">
          <header className="px-5 py-4 border-b border-line">
            <div className="marker">Details</div>
          </header>
          <dl>
            <Row label="Type" value={CONTACT_TYPE_LABEL[c.type]} />
            <Row label="Name" value={titleCase(c.name)} />
            <Row label="Company" value={c.company ? titleCase(c.company) : "—"} />
            <Row label="Email" value={c.email ?? "—"} mono />
            <Row label="Phone" value={c.phone ?? "—"} mono />
            <Row
              label="City"
              value={
                c.city
                  ? `${titleCase(c.city)}${c.country ? `, ${c.country.toUpperCase()}` : ""}`
                  : "—"
              }
            />
            <Row
              label="Added"
              value={formatDate(c.created_at)}
              mono
              last
            />
          </dl>
          {c.notes ? (
            <div className="px-5 py-4 border-t border-line">
              <div className="marker">Notes</div>
              <p className="mt-2 font-sans text-[13px] text-fg-dim leading-[1.6] whitespace-pre-line">
                {c.notes}
              </p>
            </div>
          ) : null}
        </section>

        <section className="border border-line bg-surface">
          <header className="px-5 py-4 border-b border-line">
            <div className="marker">Shows</div>
            <h2 className="font-display text-[18px] text-fg mt-1">
              {shows.length === 0
                ? "Not tied to any shows yet"
                : shows.length === 1
                  ? "1 show"
                  : `${shows.length} shows`}
            </h2>
          </header>
          {shows.length === 0 ? (
            <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
              When you link this contact to a show as promoter or agent, the
              show appears here.
            </p>
          ) : (
            <ul>
              {shows.map((s, i) => (
                <li
                  key={s.id}
                  className={
                    "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_1fr_auto] items-center gap-x-3 gap-y-1 px-5 py-3 hover:bg-surface-2 [transition-duration:80ms] " +
                    (i < shows.length - 1 ? "border-b border-line" : "")
                  }
                >
                  <span className="num font-mono text-[11px] sm:text-[12px] text-fg-dim sm:order-none">
                    {formatDate(s.show_date)}
                  </span>
                  <span className="sm:order-3 self-start">
                    <StatusBracket tone={STATUS_TONE[s.status] ?? "default"}>
                      {STATUS_LABEL[s.status] ?? s.status}
                    </StatusBracket>
                  </span>
                  <Link
                    href={`/tour/${s.id}`}
                    className="col-span-2 sm:col-span-1 sm:order-2 min-w-0 font-sans text-[14px] text-fg hover:text-accent [transition-duration:80ms]"
                  >
                    <span className="block truncate">
                      {titleCase(s.city)}
                      <span className="text-fg-dim">
                        {" · "}
                        {titleCase(s.venue_name)}
                      </span>
                    </span>
                    {(s.fee_confirmed || s.fee_offered || s.capacity) && (
                      <span className="mt-0.5 flex flex-wrap gap-x-3 num font-mono text-[11px] text-fg-faint">
                        {s.fee_confirmed || s.fee_offered ? (
                          <span>
                            {formatMoney(s.fee_confirmed ?? s.fee_offered, s.currency)}
                          </span>
                        ) : null}
                        {s.capacity ? (
                          <span>{formatCapacity(s.capacity)}</span>
                        ) : null}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({
  label,
  value,
  mono,
  last,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={
        "grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-1 sm:gap-4 px-5 py-3 " +
        (last ? "" : "border-b border-line")
      }
    >
      <dt className="label pt-1">{label}</dt>
      <dd
        className={
          (mono ? "font-mono text-[13px]" : "font-sans text-[14px]") +
          " text-fg break-words"
        }
      >
        {value}
      </dd>
    </div>
  );
}
