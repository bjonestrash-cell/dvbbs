"use client";

import { useEffect, useState, useActionState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import {
  addInventory,
  removeInventory,
  setInventoryUnits,
  initialInventoryState,
} from "../actions";
import type { MerchInventory } from "@/lib/supabase/types";

export function InventorySection({
  productId,
  inventory,
}: {
  productId: string;
  inventory: MerchInventory[];
}) {
  const [adding, setAdding] = useState(false);
  const action = addInventory.bind(null, productId);
  const [state, formAction, pending] = useActionState(
    action,
    initialInventoryState,
  );
  useEffect(() => {
    if (state.status === "ok") setAdding(false);
  }, [state]);

  const total = inventory.reduce((sum, i) => sum + (i.units_on_hand ?? 0), 0);

  return (
    <section className="border border-line bg-surface">
      <header className="flex items-baseline justify-between gap-3 px-5 py-4 border-b border-line">
        <div>
          <div className="marker">Inventory</div>
          <h2 className="font-display text-[20px] text-fg mt-1">
            Variants and stock
          </h2>
          <p className="mt-1 num font-mono text-[11px] text-fg-faint">
            {total} {total === 1 ? "unit" : "units"} across {inventory.length}{" "}
            {inventory.length === 1 ? "variant" : "variants"}
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
          {adding ? "Close" : "Add variant"}
        </button>
      </header>

      {inventory.length === 0 && !adding ? (
        <p className="px-5 py-10 text-center font-sans text-[13px] text-fg-faint">
          No variants yet.
        </p>
      ) : null}

      {inventory.length > 0 ? (
        <div>
          <div className="hidden sm:grid grid-cols-[1fr_120px_120px_1fr_36px] items-center gap-4 px-5 py-2.5 border-b border-line">
            <span className="label">Variant</span>
            <span className="label text-right">On hand</span>
            <span className="label text-right">Reorder at</span>
            <span className="label">Location</span>
            <span></span>
          </div>
          <ul>
            {inventory.map((row, i) => (
              <InventoryRow
                key={row.id}
                row={row}
                productId={productId}
                isLast={i === inventory.length - 1}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {adding ? (
        <form
          action={formAction}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-5 border-t border-line bg-page/60"
        >
          <Field label="Variant">
            <input
              name="variant"
              placeholder="S, M, L, XL or color"
              className={fieldClass}
            />
          </Field>
          <Field label="Units on hand">
            <input
              name="units_on_hand"
              type="number"
              min={0}
              defaultValue={0}
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Reorder at">
            <input
              name="reorder_threshold"
              type="number"
              min={0}
              placeholder="optional"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Warehouse location">
            <input
              name="warehouse_location"
              placeholder="LA fulfillment, road case 4..."
              className={fieldClass}
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
              disabled={pending}
              className="font-mono uppercase tracking-[0.06em] text-[11px] inline-flex items-center gap-1.5 h-9 px-4 bg-inverted text-fg-inverted hover:bg-fg disabled:opacity-60 [transition-duration:80ms]"
            >
              {pending ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Plus className="size-3" strokeWidth={1.5} />
              )}
              Add variant
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

function InventoryRow({
  row,
  productId,
  isLast,
}: {
  row: MerchInventory;
  productId: string;
  isLast: boolean;
}) {
  const [units, setUnits] = useState(row.units_on_hand);
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lowStock =
    typeof row.reorder_threshold === "number" &&
    units <= row.reorder_threshold;

  function commit(value: number) {
    if (!Number.isFinite(value) || value < 0) return;
    if (value === row.units_on_hand) return;
    startTransition(async () => {
      const r = await setInventoryUnits(productId, row.id, value);
      if (!r.ok) setUnits(row.units_on_hand);
    });
  }

  return (
    <li
      className={
        "grid grid-cols-[1fr_auto_auto] sm:grid-cols-[1fr_120px_120px_1fr_36px] items-center gap-4 px-5 py-3 hover:bg-surface-2 [transition-duration:80ms] " +
        (isLast ? "" : "border-b border-line")
      }
    >
      <span className="font-sans text-[13px] text-fg truncate">
        {row.variant ?? "Default"}
        {row.notes ? (
          <span className="block font-sans text-[11px] text-fg-faint truncate">
            {row.notes}
          </span>
        ) : null}
      </span>
      <span className="text-right">
        <input
          type="number"
          min={0}
          value={units}
          onChange={(e) => setUnits(Number(e.target.value))}
          onBlur={(e) => commit(Number(e.target.value))}
          className="num font-mono text-[13px] text-fg text-right w-20 border border-line bg-surface px-2 h-8 outline-none focus:border-line-strong"
        />
        {pending ? (
          <Loader2
            className="inline ml-1 size-3 animate-spin text-fg-faint"
            aria-hidden
          />
        ) : null}
        {lowStock ? (
          <span className="block font-mono uppercase tracking-[0.14em] text-[9px] text-holding mt-1">
            low
          </span>
        ) : null}
      </span>
      <span className="hidden sm:inline num font-mono text-[12px] text-fg-faint text-right">
        {row.reorder_threshold ?? "—"}
      </span>
      <span className="hidden sm:inline font-sans text-[12px] text-fg-dim truncate">
        {row.warehouse_location ?? "—"}
      </span>
      <span className="text-right">
        {confirmDelete ? (
          <span className="inline-flex items-center gap-1">
            <button
              type="button"
              onClick={() =>
                startTransition(async () => {
                  const r = await removeInventory(productId, row.id);
                  if (!r.ok) setConfirmDelete(false);
                })
              }
              className="font-mono uppercase tracking-[0.06em] text-[10px] h-6 px-2 bg-cancelled/10 text-cancelled hover:bg-cancelled hover:text-page [transition-duration:80ms]"
            >
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="font-mono uppercase tracking-[0.06em] text-[10px] h-6 px-2 text-fg-dim hover:text-fg [transition-duration:80ms]"
            >
              Keep
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label="Remove variant"
            className="size-6 grid place-items-center text-fg-faint hover:text-fg-dim [transition-duration:80ms]"
          >
            <X className="size-3" strokeWidth={1.5} aria-hidden />
          </button>
        )}
      </span>
    </li>
  );
}

const fieldClass =
  "h-9 w-full border border-line bg-surface px-3 font-sans text-[13px] text-fg placeholder:text-fg-faint outline-none focus:border-line-strong";

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={"flex flex-col gap-1.5" + (full ? " sm:col-span-2" : "")}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
