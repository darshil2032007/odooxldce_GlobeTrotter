import { createClient } from "@supabase/supabase-js";

// Provide safe fallback values so createClient never crashes module loading
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

/**
 * Shared Supabase client instance.
 * Developer 2 will configure the real Supabase project credentials & typed client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
