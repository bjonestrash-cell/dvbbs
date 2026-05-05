import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getShow } from "@/lib/data/shows";
import { getSettlement } from "@/lib/data/settlement";
import { AUTH_DISABLED } from "@/lib/auth/mode";
import { getCurrentMember } from "@/lib/auth/dal";
import { formatDateLong, formatMoney } from "@/lib/format";
import { SettlementForm } from "./_components/settlement-form";

export const metadata = { title: "settlement" };

export default async function SettlementPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const member = AUTH_DISABLED ? null : await getCurrentMember();
  const show = await getShow(showId);
  if (!show) notFound();

  const settlement = await getSettlement(showId);

  if (!member) {
    return (
      <>
        <PageHeader
          eyebrow="settlement"
          title={`${show.city ?? "TBD"}, ${show.venue_name ?? "TBD"}`}
          description={formatDateLong(show.show_date)}
          actions={
            <Link
              href={`/tour/${show.id}`}
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Show
            </Link>
          }
        />
        <div className="px-4 md:px-6 py-4 max-w-3xl flex flex-col gap-4">
          <SettlementSummary
            settlement={settlement}
            currency={show.currency}
          />
          <p className="text-xs text-fg-dim">
            Public demo, settlement is read-only. Sign in as principal or
            accountant to edit.
          </p>
        </div>
      </>
    );
  }

  const canSettle =
    member.role === "principal" || member.role === "accountant";

  return (
    <>
      <PageHeader
        eyebrow="settlement"
        title={`${show.city ?? "TBD"}, ${show.venue_name ?? "TBD"}`}
        description={formatDateLong(show.show_date)}
        actions={
          <Link
            href={`/tour/${show.id}`}
            className={buttonClasses({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Show
          </Link>
        }
      />

      <div className="px-4 md:px-6 py-4 max-w-3xl">
        {!canSettle ? (
          <div className="border border-line bg-surface p-4 text-sm text-fg-dim">
            Only principal and accountant roles can edit settlement. Your role
            is <span className="marker">{member.role}</span>.
          </div>
        ) : (
          <SettlementForm
            showId={show.id}
            showCurrency={show.currency}
            settlement={settlement}
            role={member.role}
          />
        )}
      </div>
    </>
  );
}

function SettlementSummary({
  settlement,
  currency,
}: {
  settlement: Awaited<ReturnType<typeof getSettlement>>;
  currency: string | null;
}) {
  if (!settlement) {
    return (
      <div className="border border-line bg-surface p-6">
        <div className="marker">no settlement yet</div>
        <p className="mt-2 text-sm text-fg-dim">
          This show has not been reconciled.
        </p>
      </div>
    );
  }
  return (
    <div className="border border-line bg-surface p-4 md:p-5 grid gap-3">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm">
        <KV label="Gross paid" value={formatMoney(settlement.gross_paid, currency)} />
        <KV label="Expenses" value={formatMoney(settlement.expenses_total, currency)} />
        <KV label="Agent commission" value={formatMoney(settlement.agent_commission, currency)} />
        <KV label="Manager commission" value={formatMoney(settlement.manager_commission, currency)} />
      </div>
      <div className="border border-line-strong bg-surface-2 p-3 flex items-center justify-between">
        <div>
          <div className="marker">net to artist</div>
          <div className="num text-xl font-medium tracking-tight tabular text-fg">
            {formatMoney(settlement.net_to_artist, currency)}
          </div>
        </div>
        <div className="text-xs text-fg-dim">
          {settlement.paid_in_full ? "Paid in full" : "Outstanding"}
          {settlement.paid_date ? ` . ${settlement.paid_date}` : ""}
        </div>
      </div>
      {settlement.notes ? (
        <div>
          <div className="marker">notes</div>
          <p className="mt-1 text-sm text-fg-dim whitespace-pre-line">
            {settlement.notes}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function KV({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="marker">{label}</span>
      <span className="num text-fg">{value}</span>
    </div>
  );
}
