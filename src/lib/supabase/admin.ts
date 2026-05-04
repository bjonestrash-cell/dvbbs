import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let cached: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Service-role admin client. Bypasses RLS. Server only.
 * Used for bootstrap (first-user-becomes-principal) and Bandsintown sync.
 */
export function createAdminClient() {
  if (cached) return cached;
  cached = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
  return cached;
}
