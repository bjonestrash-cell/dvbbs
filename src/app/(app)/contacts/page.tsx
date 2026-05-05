import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonClasses } from "@/components/ui/button";
import {
  listContacts,
  listContactCountsByType,
} from "@/lib/data/contacts";
import {
  CONTACT_TYPE_LABEL,
  CONTACT_TYPE_ORDER,
} from "@/lib/data/contacts-shared";
import type { ContactType } from "@/lib/supabase/types";
import { ContactFilters } from "./_components/contact-filters";

export const metadata = { title: "Contacts. DVBBS HQ" };

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const validType = (CONTACT_TYPE_ORDER as string[]).includes(sp.type ?? "")
    ? (sp.type as ContactType)
    : undefined;

  const [contacts, counts] = await Promise.all([
    listContacts({ type: validType, q: sp.q || undefined }),
    listContactCountsByType(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Rolodex"
        title="Contacts"
        description="Promoters, agents, label, crew."
        actions={
          <Link
            href="/contacts/new"
            className={buttonClasses({ variant: "primary", size: "sm" })}
          >
            + New contact
          </Link>
        }
      />
      <ContactFilters counts={counts} />

      {contacts.length === 0 ? (
        <div className="px-6 md:px-10 py-10">
          <EmptyState
            title="Your rolodex is empty."
            hint="Add a promoter, agent, or venue to start the network."
            action={
              <Link
                href="/contacts/new"
                className={buttonClasses({ variant: "primary", size: "sm" })}
              >
                + New contact
              </Link>
            }
          />
        </div>
      ) : (
        <div className="px-6 md:px-10 py-8">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="block bg-surface border border-line p-5 hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-display text-[18px] text-fg leading-tight">
                        {titleCase(c.name)}
                      </h3>
                      {c.company ? (
                        <p className="mt-1 font-sans text-[13px] text-fg-dim">
                          {titleCase(c.company)}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                      {CONTACT_TYPE_LABEL[c.type]}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-fg-faint">
                    {c.email ? <span className="num">{c.email}</span> : null}
                    {c.phone ? <span className="num">{c.phone}</span> : null}
                    {c.city ? (
                      <span>{titleCase(c.city)}{c.country ? `, ${c.country.toUpperCase()}` : ""}</span>
                    ) : null}
                  </div>
                  <div className="mt-3 inline-flex items-center gap-1 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-dim">
                    Open
                    <ArrowRight className="size-3" strokeWidth={1.5} aria-hidden />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
