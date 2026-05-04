"use server";

import { headers } from "next/headers";
import * as z from "zod";
import { createClient } from "@/lib/supabase/server";
import { isWhitelisted } from "@/lib/auth/whitelist";

const EmailSchema = z.object({
  email: z.email({ error: "Enter a valid email." }).trim().toLowerCase(),
});

export type LoginState = {
  status: "idle" | "ok" | "error";
  message?: string;
  email?: string;
};

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = EmailSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { status: "error", message: "Enter a valid email." };
  }
  const { email } = parsed.data;

  if (!isWhitelisted(email)) {
    return {
      status: "error",
      message: "This email is not on the team. Ask a principal to add you.",
    };
  }

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const origin = `${proto}://${host}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "ok", email };
}
