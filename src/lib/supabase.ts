import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client met de service-role key. Wordt ALLEEN in
 * server components / server actions / route handlers gebruikt, nooit in de
 * browser. De key staat in de server-omgevingsvariabelen.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en " +
        "SUPABASE_SERVICE_ROLE_KEY in je omgevingsvariabelen (.env.local)."
    );
  }

  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export const PHOTO_BUCKET = "photos";

/** Publieke URL voor een opgeslagen foto. */
export function photoPublicUrl(storagePath: string): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  return `${url}/storage/v1/object/public/${PHOTO_BUCKET}/${storagePath}`;
}
