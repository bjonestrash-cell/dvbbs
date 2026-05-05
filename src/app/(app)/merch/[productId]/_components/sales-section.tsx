"use client";

import { useEffect, useState, useActionState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  recordSale,
  removeSale,
  initialSaleState,
} from "../actions";
import type { MerchInventory, MerchSale, Show } from "@/lib/supabase/types";
import { formatDateCompact, formatMoney } from "@/lib/format";
import { MERCH_SALE_SOURCE_LABEL } from "@/lib/data/merch-shared";

export function SalesSection({
  productId,
  sales,
  inventory,
  shows,
}: {
  productId: string;
  sales: MerchSale[];
  inventory: MerchInventory[];
  shows: Show[];
}) {
  const [adding, setAdding] = useState(false);
  const [pending, startTransition] = useTransition();
  const action = recordSale.bind(null, productId);
  const [state, formAction, posting] = useActionState(action, initialSaleState);
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  const totalUnits = sales.reduce((sum, s) => sum + (s.units_sold ?? 0), 0);
  const totalGross = sales.reduce((sum, s) => sum + Number(s.gross ?? 0), 0);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <section className="border border-line bg-surface">
      <header className="flex items-baseline justify-between gap-3 px-5 py-4 border-b border-line">
        <div>
          <div className="marker">Sales</div>
          <h2 className="font-display text-[20px] text-fg mt-1">History</h2>
          <p className="mt-1 num font-mono text-[11px] text-fg-faint">
            {totalUnits} sold, {formatMoney(totalGross, "USD")} gross
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding((v) => !v)}
          className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.06em] text-[11px] text-fg-dim hover:text-fg [transition-duration:80ms]"
        >
          {adding ? (
            <X className="size-3" strokeWidth={1.5} aria-hidden />
          ) : (
            <Plus className="size-3" strokeWidth={1.5} aria-hidden />
          )}
          {adding ? "Close" : "Record sale"}
        </button>
      </header>

      {sales.length === 0 && !adding ? (
        <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
          No sales recorded yet.
        </p>
      ) : null}

      {sales.length > 0 ? (
        <ul>
          <li className="hidden sm:grid grid-cols-[100px_1fr_100px_120px_120px_36px] items-center gap-4 px-5 py-2.5 border-b border-line">
            <span className="label">Date</span>
            <span className="label">Variant / show</span>
            <span className="label text-right">Units</span>
            <span className="label text-right">Gross</span>
            <span className="label">Source</span>
            <span></span>
          </li>
          {sales.map((s, i) => (
            <li
              key={s.id}
              className={
                "grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_1fr_100px_120px_120px_36px] items-center gap-x-3 gap-y-1 sm:gap-4 px-5 py-3 hover:bg-surface-2 [transition-duration:80ms] " +
                (i < sales.length - 1 ? "border-b border-line" : "")
              }
            >
              <div className="min-w-0 flex flex-col gap-0.5 sm:contents">
                <span className="num font-mono text-[11px] sm:text-[12px] text-fg-dim">
                  {formatDateCompact(s.sale_date)}
                </span>
                <span className="font-sans text-[13px] text-fg truncate">
                  {s.variant ?? "Default"}
                  {s.show_id
                    ? ` · ${shows.find((sh) => sh.id === s.show_id)?.city ?? "Show"}`
                    : ""}
                  {s.notes ? (
                    <span className="block font-sans text-[11px] text-fg-faint truncate">
                      {s.notes}
                    </span>
                  ) : null}
                </span>
                <span className="sm:hidden mt-0.5 num font-mono text-[11px] text-fg-dim flex flex-wrap gap-x-3">
                  <span>{s.units_sold} units</span>
                  <span className="text-fg">{formatMoney(Number(s.gross), "USD")}</span>
                  <span className="text-fg-faint uppercase tracking-[0.06em]">
                    {MERCH_SALE_SOURCE_LABEL[s.source]}
                  </span>
                </span>
              </div>
              <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
                {s.units_sold}
              </span>
              <span className="hidden sm:inline num font-mono text-[12px] text-fg text-right">
                {formatMoney(Number(s.gross), "USD")}
              </span>
              <span className="hidden sm:inline font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint">
                {MERCH_SALE_SOURCE_LABEL[s.source]}
              </span>
              <span className="text-right self-start sm:self-center">
                <button
                  type="button"
                  onClick={() =>
                    startTransition(async () => {
                      await removeSale(productId, s.id);
                    })
                  }
                  disabled={pending}
                  aria-label="Remove sale"
                  className="size-9 sm:size-6 grid place-items-center text-fg-faint hover:text-fg-dim [transition-duration:80ms]"
                >
                  <X className="size-4 sm:size-3" strokeWidth={1.5} aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 border-t border-line bg-page/60"
        >
          <Field label="Sale date" required>
            <input
              name="sale_date"
              type="date"
              defaultValue={today}
              required
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Source">
            <select name="source" defaultValue="tour" className={fieldClass}>
              {(["shopify", "tour", "wholesale", "other"] as const).map((s) => (
                <option key={s} value={s}>
                  {MERCH_SALE_SOURCE_LABEL[s]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Variant">
            <select name="variant" defaultValue="" className={fieldClass}>
              <option value="">No variant</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.variant ?? ""}>
                  {i.variant ?? "Default"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Show (optional)">
            <select name="show_id" defaultValue="" className={fieldClass}>
              <option value="">None</option>
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.show_date ?? "TBD") + " · " + (s.city ?? "TBD")}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Units sold" required>
            <input
              name="units_sold"
              type="number"
              min={1}
              required
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Gross (USD)" required>
            <input
              name="gross"
              type="number"
              min={0}
              step="0.01"
              required
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Notes" full>
            <input name="notes" placeholder="Optional" className={fieldClass} />
          </Field>
          {state.status === "error" ? (
            <p className="col-span-full font-sans text-[12px] text-cancelled">
              {state.message}
            </p>
          ) : null}
          <div className="col-span-full flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={posting}
              className="font-mono uppercase tracking-[0.06em] text-[11px] inline-flex items-center gap-1.5 h-9 px-4 bg-inverted text-fg-inverted hover:bg-fg disabled:opacity-60 [transition-duration:80ms]"
            >
              {posting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" strokeWidth={1.5} />
              )}
              Record sale
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="font-mono uppercase tracking-[0.06em] text-[11px] inline-flex items-center gap-1.5 h-9 px-3 text-fg-dim hover:text-fg hover:bg-surface-2 [transition-duration:80ms]"
            >
              <X className="size-3" strokeWidth={1.5} />
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </section>
  );
}

const fieldClass =
  "h-9 w-full border border-line bg-surface px-3 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

function Field({
  label,
  children,
  required,
  full,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <label className={"flex flex-col gap-1.5" + (full ? " sm:col-span-2" : "")}>
      <span className="label">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
