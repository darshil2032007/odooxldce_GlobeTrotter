import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

/**
 * Shared Supabase client instance.
 * Developer 2 will configure the full data layer and typed client.
 * This provides the base client for auth and initial queries.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
