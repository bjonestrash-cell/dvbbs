"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireRole } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/data/releases";

const NewLinkSchema = z.object({
  slug: z.string().min(1).max(80),
  title: z.string().max(200).optional().or(z.literal("")),
  release_id: z.string().uuid().optional().or(z.literal("")),
  spotify: z.url().optional().or(z.literal("")),
  apple: z.url().optional().or(z.literal("")),
  soundcloud: z.url().optional().or(z.literal("")),
  youtube: z.url().optional().or(z.literal("")),
  beatport: z.url().optional().or(z.literal("")),
});

export type NewLinkState = {
  status: "idle" | "error";
  message?: string;
  errors?: Record<string, string[]>;
};

export async function createSmartLink(
  _prev: NewLinkState,
  formData: FormData,
): Promise<NewLinkState> {
  await requireRole("principal", "manager");
  const parsed = NewLinkSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }
  const v = parsed.data;
  const slug = slugify(v.slug) || v.slug;

  const destinations: Record<string, string> = {};
  if (v.spotify) destinations.spotify = v.spotify;
  if (v.apple) destinations.apple = v.apple;
  if (v.soundcloud) destinations.soundcloud = v.soundcloud;
  if (v.youtube) destinations.youtube = v.youtube;
  if (v.beatport) destinations.beatport = v.beatport;

  if (Object.keys(destinations).length === 0) {
    return { status: "error", message: "Add at least one platform URL." };
  }

  const supabase = await createClient();
  const exists = await supabase
    .from("smart_links")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (exists.data) {
    return {
      status: "error",
      errors: { slug: ["Slug already in use."] },
    };
  }

  const { error } = await supabase.from("smart_links").insert({
    slug,
    title: v.title || null,
    release_id: v.release_id || null,
    destinations,
  });
  if (error) return { status: "error", message: error.message };

  revalidatePath("/releases/links");
  redirect("/releases/links");
}
