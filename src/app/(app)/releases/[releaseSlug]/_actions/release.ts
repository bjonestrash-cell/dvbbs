"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";

const UpdateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z
    .string()
    .min(1)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, digits, dashes."),
  type: z.enum(["single", "ep", "album", "remix", "edit", "bootleg"]),
  status: z.enum([
    "idea",
    "in_production",
    "mixing",
    "mastered",
    "delivered",
    "scheduled",
    "released",
    "archived",
  ]),
  release_date: z.string().optional().or(z.literal("")),
  label: z.string().max(120).optional().or(z.literal("")),
  isrc: z.string().max(40).optional().or(z.literal("")),
  upc: z.string().max(40).optional().or(z.literal("")),
  collaborators: z.string().max(500).optional().or(z.literal("")),
  smart_link_slug: z
    .string()
    .max(80)
    .optional()
    .or(z.literal(""))
    .refine(
      (v) => !v || /^[a-z0-9-]+$/.test(v),
      "Smart link slug must be lowercase letters, digits, dashes.",
    ),
  spotify_url: z.url().optional().or(z.literal("")),
  apple_url: z.url().optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export type UpdateReleaseState = {
  status: "idle" | "ok" | "error";
  message?: string;
  errors?: Record<string, string[]>;
  /** New slug, used by the client form to navigate after a slug change. */
  newSlug?: string;
};

export async function updateRelease(
  releaseId: string,
  currentSlug: string,
  _prev: UpdateReleaseState,
  formData: FormData,
): Promise<UpdateReleaseState> {
  await requireRole("principal", "manager");
  const parsed = UpdateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }
  const v = parsed.data;
  const collaborators = v.collaborators
    ? v.collaborators
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    : [];

  const supabase = await createClient();
  const { error } = await supabase
    .from("releases")
    .update({
      title: v.title,
      slug: v.slug,
      type: v.type,
      status: v.status,
      release_date: v.release_date || null,
      label: v.label || null,
      isrc: v.isrc || null,
      upc: v.upc || null,
      collaborators: collaborators.length > 0 ? collaborators : null,
      smart_link_slug: v.smart_link_slug || null,
      spotify_url: v.spotify_url || null,
      apple_url: v.apple_url || null,
      notes: v.notes || null,
    })
    .eq("id", releaseId);

  if (error) {
    return { status: "error", message: error.message };
  }

  // Revalidate every surface that surfaces this release.
  revalidatePath("/releases");
  revalidatePath(`/releases/${currentSlug}`);
  if (v.slug !== currentSlug) {
    revalidatePath(`/releases/${v.slug}`);
    redirect(`/releases/${v.slug}`);
  }
  return { status: "ok", newSlug: v.slug };
}

/** Delete a release. Cascades any FK relationships per the schema (assets,
 *  marketing rows, smart links typically reference release_id with ON DELETE
 *  CASCADE; if not, the DB will surface the constraint error). Principal
 *  and manager only. */
export async function deleteRelease(releaseId: string) {
  await requireRole("principal", "manager");
  const supabase = await createClient();
  const { error } = await supabase
    .from("releases")
    .delete()
    .eq("id", releaseId);
  if (error) {
    return { ok: false as const, message: error.message };
  }
  revalidatePath("/releases");
  redirect("/releases");
}
