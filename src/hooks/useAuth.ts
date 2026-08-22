import { useAuthContext } from "@/context/AuthContext";

/**
 * Convenience hook for accessing auth state.
 * Re-exports from AuthContext for cleaner imports.
 */
export function useAuth() {
  return useAuthContext();
}
