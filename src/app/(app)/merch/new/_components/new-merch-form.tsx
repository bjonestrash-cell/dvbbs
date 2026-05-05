"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { ArrowLeft, Check, Loader2, Upload } from "lucide-react";
import { createProduct, type NewProductState } from "../actions";
import { buttonClasses } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/browser";
import type { Show } from "@/lib/supabase/types";

const initial: NewProductState = { status: "idle" };

const STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "sold_out", label: "Sold out" },
  { value: "archived", label: "Archived" },
] as const;

export function NewMerchForm({ shows }: { shows: Show[] }) {
  const [state, action, pending] = useActionState(createProduct, initial);
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [tourExclusive, setTourExclusive] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const sb = createClient();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${safe}`;
      const { error } = await sb.storage
        .from("merch-images")
        .upload(path, file, { upsert: false });
      if (error) {
        setUploadError(error.message);
      } else {
        const { data } = sb.storage.from("merch-images").getPublicUrl(path);
        setImageUrl(data.publicUrl);
      }
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  return (
    <form
      action={action}
      className="flex flex-col gap-5 px-6 md:px-10 py-8 md:py-10 max-w-3xl form-bottom-pad md:pb-10"
    >
      <Section title="Product" eyebrow="step 1">
        <Field label="Name" required error={state.errors?.name}>
          <input
            name="name"
            required
            placeholder="DVBBS Logo Tee"
            className={fieldClass}
          />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="SKU">
            <input
              name="sku"
              placeholder="DVBBS-TEE-BLK"
              className={fieldClass}
            />
          </Field>
          <Field label="Category">
            <input
              name="category"
              placeholder="Apparel, accessories, vinyl..."
              className={fieldClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Pricing" eyebrow="step 2">
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="Retail price (USD)">
            <input
              name="price"
              type="number"
              min={0}
              step="1"
              placeholder="35"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Cost per unit">
            <input
              name="cost_per_unit"
              type="number"
              min={0}
              step="0.01"
              placeholder="12.50"
              className={fieldClass + " num"}
            />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue="draft" className={fieldClass}>
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title="Image" eyebrow="step 3">
        <input type="hidden" name="image_url" value={imageUrl} />
        <Field label="Product image">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex h-10 items-center gap-1.5 border border-line bg-surface px-3 font-sans text-[13px] hover:border-line-strong [transition-duration:80ms] disabled:opacity-50"
              >
                {uploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <Upload className="size-4" strokeWidth={1.5} aria-hidden />
                )}
                {imageUrl ? "Replace image" : "Upload image"}
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="preview"
                  className="size-12 object-cover border border-line"
                />
              ) : null}
              {uploadError ? (
                <span className="font-sans text-[12px] text-cancelled">
                  {uploadError}
                </span>
              ) : null}
            </div>
            <p className="font-sans text-[12px] text-fg-faint">
              Or paste a public image URL.
            </p>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={fieldClass}
            />
          </div>
        </Field>
      </Section>

      <Section title="Tour-exclusive drop" eyebrow="optional">
        <Field label="Tied to a show">
          <label className="inline-flex items-center gap-2 font-sans text-[13px] mb-2">
            <input
              type="checkbox"
              name="is_tour_exclusive"
              checked={tourExclusive}
              onChange={(e) => setTourExclusive(e.target.checked)}
              className="size-4 accent-accent"
            />
            <span>Tour exclusive (auto-archives after the show)</span>
          </label>
          {tourExclusive ? (
            <select
              name="exclusive_show_id"
              defaultValue=""
              className={fieldClass}
            >
              <option value="">Pick a show.</option>
              {shows.map((s) => (
                <option key={s.id} value={s.id}>
                  {(s.show_date ?? "Date TBD") + " · " + (s.city ?? "TBD") + ", " + (s.venue_name ?? "TBD")}
                </option>
              ))}
            </select>
          ) : null}
        </Field>
        <Field label="Notes">
          <textarea
            name="notes"
            rows={3}
            placeholder="Vendor info, fabric, sizes available..."
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
              Creating
            </>
          ) : (
            <>
              <Check className="size-4" strokeWidth={1.5} aria-hidden />
              Create product
            </>
          )}
        </button>
        <Link
          href="/merch"
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
        <span className="font-sans text-[12px] text-cancelled">
          {error[0]}
        </span>
      ) : null}
    </label>
  );
}
