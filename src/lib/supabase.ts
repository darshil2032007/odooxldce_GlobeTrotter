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
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim() || "";
const supabaseAnonKey = rawKey || "placeholder-anon-key";

// Check if the key is a standard JWT (starts with eyJ...) to determine if autoRefreshToken is safe
const isStandardJwtKey = rawKey.startsWith("eyJ");

/**
 * Shared Supabase client instance.
 * Single static instance used throughout the app.
 *
 * NOTE: autoRefreshToken is explicitly set to false unless a valid JWT key is provided
 * to prevent Supabase JS SDK from running background auto-refresh loops (which fire thousands of requests).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isStandardJwtKey,
    autoRefreshToken: isStandardJwtKey,
    detectSessionInUrl: false,
  },
});
