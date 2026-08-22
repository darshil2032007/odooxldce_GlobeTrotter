import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import {
  onAuthStateChange,
  signOut as authSignOut,
  signIn as authSignIn,
  signUp as authSignUp,
  resetPassword as authResetPassword,
  type SignInParams,
  type SignUpParams,
} from "@/services/auth/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { useProfile, profileKeys, MOCK_DEVELOPMENT_PROFILE } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (params: SignInParams) => Promise<{ user: User | null; session: Session | null }>;
  signUp: (params: SignUpParams) => Promise<{ user: User | null; session: Session | null }>;
  resetPassword: (email: string, redirectTo?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ user: null, session: null }),
  signUp: async () => ({ user: null, session: null }),
  resetPassword: async () => {},
  refreshProfile: async () => {},
});

// Mock user for UI preview when no active Supabase credentials/session exist
const MOCK_DEVELOPMENT_USER: User = {
  id: "dev-user-123",
  app_metadata: {},
  user_metadata: { full_name: "Alex Traveler" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "alex.traveler@example.com",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(
    isSupabaseConfigured ? null : MOCK_DEVELOPMENT_USER
  );
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // TanStack Query handles fetching, caching, deduplication & staleTime for profile
  const { data: profileData, refetch: refetchProfile } = useProfile(user?.id);

  // Derive profile: cached query data, fallback metadata object, or mock development profile
  const profile: Profile | null = !isSupabaseConfigured
    ? MOCK_DEVELOPMENT_PROFILE
    : profileData ??
      (user
        ? {
            id: user.id,
            email: user.email ?? null,
            full_name: (user.user_metadata?.full_name as string) ?? null,
            avatar_url: (user.user_metadata?.avatar_url as string) ?? null,
            created_at: user.created_at ?? new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : null);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: profileKeys.detail(user.id) });
      await refetchProfile();
    }
  }, [user, queryClient, refetchProfile]);

  useEffect(() => {
    let mounted = true;

    try {
      const {
        data: { subscription },
      } = onAuthStateChange((_event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        if (currentSession?.user) {
          setUser(currentSession.user);
        } else if (!isSupabaseConfigured) {
          setUser(MOCK_DEVELOPMENT_USER);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      if (mounted) setLoading(false);
      return () => {
        mounted = false;
      };
    }
  }, []);

  const signOut = async () => {
    try {
      await authSignOut();
    } catch (err) {
      console.warn("SignOut warning:", err);
    }
    setUser(null);
    setSession(null);
    queryClient.removeQueries({ queryKey: profileKeys.all });
  };

  const signIn = async (params: SignInParams) => {
    const result = await authSignIn(params);
    if (result.session?.user) {
      setUser(result.session.user);
      setSession(result.session);
    }
    return result;
  };

  const signUp = async (params: SignUpParams) => {
    const result = await authSignUp(params);
    if (result.session?.user) {
      setUser(result.session.user);
      setSession(result.session);
    }
    return result;
  };

  const resetPassword = async (email: string, redirectTo?: string) => {
    await authResetPassword(email, redirectTo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        signIn,
        signUp,
        resetPassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
