import { supabase } from "@/lib/supabase";
import type { Profile, ProfileUpdate } from "@/types/database";
import type { Session, User, AuthChangeEvent } from "@supabase/supabase-js";

export interface SignUpParams {
  email: string;
  password: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * Sign up a new user with email, password, and optional full name.
 */
export async function signUp({ email, password, fullName, avatarUrl }: SignUpParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        avatar_url: avatarUrl,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with email and password.
 */
export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with third-party OAuth provider (e.g. Google, GitHub).
 */
export async function signInWithOAuth(provider: "google" | "github", redirectTo?: string) {
  const redirectUrl = redirectTo || `${window.location.origin}/dashboard`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out current authenticated session.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Send password reset email.
 */
export async function resetPassword(email: string, redirectTo?: string): Promise<void> {
  const redirectUrl = redirectTo || `${window.location.origin}/login`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) throw error;
}

/**
 * Update password for current authenticated user.
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Get current authenticated user.
 */
export async function getCurrentUser(): Promise<User | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Get current session.
 */
export async function getCurrentSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Fetch profile data for a specific user.
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Update profile data for a user.
 */
export async function updateUserProfile(
  userId: string,
  profileUpdates: ProfileUpdate
): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Subscribe to Supabase auth state changes.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}
