"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/data/releases";

const NewReleaseSchema = z.object({
  title: z.string().min(1).max(200),
  type: z.enum(["single", "ep", "album", "remix", "edit", "bootleg"]),
  status: z
    .enum([
      "idea",
      "in_production",
      "mixing",
      "mastered",
      "delivered",
      "scheduled",
      "released",
      "archived",
    ])
    .default("idea"),
  release_date: z.string().optional().or(z.literal("")),
  label: z.string().max(120).optional().or(z.literal("")),
  collaborators: z.string().max(400).optional().or(z.literal("")),
  notes: z.string().max(4000).optional().or(z.literal("")),
});

export type NewReleaseState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createRelease(
  _prev: NewReleaseState,
  formData: FormData,
): Promise<NewReleaseState> {
  await requireRole("principal", "manager");

  const parsed = NewReleaseSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return {
      status: "error",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  const v = parsed.data;

  const supabase = await createClient();
  const baseSlug = slugify(v.title);
  const slug = await uniqueSlug(supabase, baseSlug);

  const collaborators = v.collaborators
    ? v.collaborators
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : null;

  const { data, error } = await supabase
    .from("releases")
    .insert({
      title: v.title,
      slug,
      type: v.type,
      status: v.status,
      release_date: v.release_date || null,
      label: v.label || null,
      collaborators,
      notes: v.notes || null,
    })
    .select("slug")
    .single();

  if (error || !data) {
    return {
      status: "error",
      message: error?.message ?? "Could not create release.",
    };
  }

  revalidatePath("/releases");
  redirect(`/releases/${(data as { slug: string }).slug}`);
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
): Promise<string> {
  let candidate = base || "release";
  let attempt = 1;
  while (true) {
    const { data } = await supabase
      .from("releases")
      .select("slug")
      .eq("slug", candidate)
      .maybeSingle();
    if (!data) return candidate;
    attempt += 1;
    candidate = `${base}-${attempt}`;
    if (attempt > 50) {
      return `${base}-${Date.now()}`;
    }
  }
}
