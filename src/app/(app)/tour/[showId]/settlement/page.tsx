import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { buttonClasses } from "@/components/ui/button";
import { getShow } from "@/lib/data/shows";
import { getSettlement } from "@/lib/data/settlement";
import { requireMember } from "@/lib/auth/dal";
import { formatDateLong } from "@/lib/format";
import { SettlementForm } from "./_components/settlement-form";

export const metadata = { title: "Settlement. DVBBS HQ" };

export default async function SettlementPage({
  params,
}: {
  params: Promise<{ showId: string }>;
}) {
  const { showId } = await params;
  const member = await requireMember();
  const show = await getShow(showId);
  if (!show) notFound();

  const settlement = await getSettlement(showId);
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
          <div className="rounded-md border border-line bg-bg-surface p-4 text-sm text-fg-muted">
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
