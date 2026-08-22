import { createClient } from "@supabase/supabase-js";

/**
 * Sanitizes Supabase URL by removing accidental trailing paths (/rest/v1, /auth/v1) or slashes
 * to prevent invalid endpoints from triggering rapid CORS retry loops.
 */
function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) {
    return "https://placeholder-project.supabase.co";
  }

  let cleaned = rawUrl.trim();

  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, "");

  // Strip trailing API paths if accidentally added in .env
  cleaned = cleaned.replace(/\/(rest|auth)\/v\d+$/i, "");
  cleaned = cleaned.replace(/\/+$/, "");

  return cleaned;
}

const supabaseUrl = sanitizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "placeholder-anon-key";

/**
 * Shared Supabase client instance.
 * Single static instance used throughout the app.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
