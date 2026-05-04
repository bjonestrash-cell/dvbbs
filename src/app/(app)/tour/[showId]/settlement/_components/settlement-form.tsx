"use client";

import {
  useState,
  useActionState,
  useEffect,
  useRef,
  useTransition,
} from "react";
import {
  Check,
  Loader2,
  Lock,
  Unlock,
  Upload,
  FileText,
} from "lucide-react";
import {
  saveSettlement,
  setSettlementLock,
  initialSettlementState,
} from "../actions";
import { createClient } from "@/lib/supabase/browser";
import { formatMoney } from "@/lib/format";
import type { ShowSettlement, AppRole } from "@/lib/supabase/types";

type Props = {
  showId: string;
  showCurrency: string | null;
  settlement: ShowSettlement | null;
  role: AppRole;
};

export function SettlementForm({ showId, showCurrency, settlement, role }: Props) {
  const action = saveSettlement.bind(null, showId);
  const [state, formAction, pending] = useActionState(
    action,
    initialSettlementState,
  );

  const [gross, setGross] = useState(settlement?.gross_paid?.toString() ?? "");
  const [expenses, setExpenses] = useState(
    settlement?.expenses_total?.toString() ?? "",
  );
  const [agent, setAgent] = useState(
    settlement?.agent_commission?.toString() ?? "",
  );
  const [manager, setManager] = useState(
    settlement?.manager_commission?.toString() ?? "",
  );
  const [paidInFull, setPaidInFull] = useState(
    settlement?.paid_in_full ?? false,
  );
  const [paidDate, setPaidDate] = useState(settlement?.paid_date ?? "");
  const [notes, setNotes] = useState(settlement?.notes ?? "");
  const [invoicePath, setInvoicePath] = useState(settlement?.invoice_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  const net = computeNet(gross, expenses, agent, manager);
  const locked = settlement?.locked ?? false;
  const canEdit = !locked || role === "principal";
  const canLock = role === "principal";
  const currency = showCurrency || "USD";

  useEffect(() => {
    if (state.status === "ok") {
      // Stay on the page, refresh inputs from new settlement state will happen via revalidate.
    }
  }, [state]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const sb = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${showId}/${Date.now()}-${safeName}`;
      const { error } = await sb.storage
        .from("settlement-docs")
        .upload(path, file, { upsert: false });
      if (error) {
        setUploadError(error.message);
      } else {
        setInvoicePath(path);
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label={`Gross paid (${currency})`}>
          <input
            name="gross_paid"
            type="number"
            min={0}
            step="100"
            value={gross}
            onChange={(e) => setGross(e.target.value)}
            disabled={!canEdit}
            className={fieldClass + " num"}
          />
        </Field>
        <Field label="Expenses total">
          <input
            name="expenses_total"
            type="number"
            min={0}
            step="100"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            disabled={!canEdit}
            className={fieldClass + " num"}
          />
        </Field>
        <Field label="Agent commission">
          <input
            name="agent_commission"
            type="number"
            min={0}
            step="100"
            value={agent}
            onChange={(e) => setAgent(e.target.value)}
            disabled={!canEdit}
            className={fieldClass + " num"}
          />
        </Field>
        <Field label="Manager commission">
          <input
            name="manager_commission"
            type="number"
            min={0}
            step="100"
            value={manager}
            onChange={(e) => setManager(e.target.value)}
            disabled={!canEdit}
            className={fieldClass + " num"}
          />
        </Field>
      </div>

      <div className="rounded-md border border-line-strong bg-bg-elev p-4 flex items-center justify-between">
        <div>
          <div className="marker">net to artist</div>
          <div className="num text-2xl font-medium tracking-tight tabular text-fg">
            {formatMoney(net, currency)}
          </div>
        </div>
        <div className="text-xs text-fg-muted text-right">
          gross minus expenses, agent, manager
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Paid in full">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="paid_in_full"
              checked={paidInFull}
              onChange={(e) => setPaidInFull(e.target.checked)}
              disabled={!canEdit}
              className="size-4 accent-accent"
            />
            <span>Yes</span>
          </label>
        </Field>
        <Field label="Paid date">
          <input
            name="paid_date"
            type="date"
            value={paidDate}
            onChange={(e) => setPaidDate(e.target.value)}
            disabled={!canEdit}
            className={fieldClass + " num"}
          />
        </Field>
      </div>

      <Field label="Invoice or wire confirmation">
        <input type="hidden" name="invoice_url" value={invoicePath} />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={!canEdit || uploading}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-line bg-bg-input px-3 text-sm transition-colors hover:border-line-strong disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Upload className="size-4" aria-hidden />
            )}
            {invoicePath ? "Replace" : "Upload"}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFile}
            className="hidden"
          />
          {invoicePath ? (
            <a
              href={`/api/settlement/${showId}/invoice`}
              className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg"
            >
              <FileText className="size-3.5" aria-hidden />
              {invoicePath.split("/").pop()}
            </a>
          ) : null}
          {uploadError ? (
            <span className="text-xs text-accent">{uploadError}</span>
          ) : null}
        </div>
      </Field>

      <Field label="Notes">
        <textarea
          name="notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={!canEdit}
          className="w-full rounded-md border border-line bg-bg-input px-3 py-2 text-sm placeholder:text-fg-dim outline-none focus:border-line-strong resize-y"
        />
      </Field>

      {state.status === "error" && state.message ? (
        <p className="text-sm text-accent">{state.message}</p>
      ) : null}
      {state.status === "ok" ? (
        <p className="text-sm text-status-confirmed">Saved.</p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
        <button
          type="submit"
          disabled={!canEdit || pending}
          className="inline-flex h-10 items-center gap-1.5 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Check className="size-4" aria-hidden />
          )}
          Save settlement
        </button>

        {canLock ? (
          <button
            type="button"
            onClick={() =>
              startTransition(async () => {
                await setSettlementLock(showId, !locked);
              })
            }
            className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-bg-surface px-3 text-sm transition-colors hover:border-line-strong"
          >
            {locked ? (
              <>
                <Unlock className="size-4" aria-hidden />
                Unlock
              </>
            ) : (
              <>
                <Lock className="size-4" aria-hidden />
                Lock
              </>
            )}
          </button>
        ) : locked ? (
          <span className="inline-flex h-10 items-center gap-1.5 rounded-md border border-line bg-bg-surface px-3 text-xs text-fg-muted">
            <Lock className="size-3.5" aria-hidden />
            Locked, principal only
          </span>
        ) : null}
      </div>
    </form>
  );
}

const fieldClass =
  "h-10 w-full rounded-md border border-line bg-bg-input px-3 text-sm text-fg placeholder:text-fg-dim outline-none focus:border-line-strong disabled:opacity-50";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="marker">{label}</span>
      {children}
    </label>
  );
}

function computeNet(
  gross: string,
  expenses: string,
  agent: string,
  manager: string,
): number {
  const g = parseFloat(gross) || 0;
  const e = parseFloat(expenses) || 0;
  const a = parseFloat(agent) || 0;
  const m = parseFloat(manager) || 0;
  return g - e - a - m;
}
