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
  getCurrentSession,
  getUserProfile,
  onAuthStateChange,
  signOut as authSignOut,
  signIn as authSignIn,
  signUp as authSignUp,
  resetPassword as authResetPassword,
  type SignInParams,
  type SignUpParams,
} from "@/services/auth/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
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
  isConfigured: false,
  signOut: async () => {},
  signIn: async () => ({ user: null, session: null }),
  signUp: async () => ({ user: null, session: null }),
  resetPassword: async () => {},
  refreshProfile: async () => {},
});

// Mock user and profile for UI preview when no active Supabase credentials/session exist
const MOCK_DEVELOPMENT_USER: User = {
  id: "dev-user-123",
  app_metadata: {},
  user_metadata: { full_name: "Alex Traveler" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "alex.traveler@example.com",
};

const MOCK_DEVELOPMENT_PROFILE: Profile = {
  id: "dev-user-123",
  email: "alex.traveler@example.com",
  full_name: "Alex Traveler",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(
    isSupabaseConfigured ? null : MOCK_DEVELOPMENT_USER
  );
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(
    isSupabaseConfigured ? null : MOCK_DEVELOPMENT_PROFILE
  );
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const data = await getUserProfile(userId);
      if (data) {
        setProfile(data);
      } else {
        // Fallback profile if row not yet populated
        setProfile({
          id: userId,
          email: user?.email ?? null,
          full_name: (user?.user_metadata?.full_name as string) ?? null,
          avatar_url: (user?.user_metadata?.avatar_url as string) ?? null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn("Could not fetch user profile:", err);
    }
  }, [user]);

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const initialSession = await getCurrentSession();
        if (mounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            fetchProfile(initialSession.user.id);
          } else if (!isSupabaseConfigured) {
            // Keep mock user for effortless local frontend exploration
            setUser(MOCK_DEVELOPMENT_USER);
            setProfile(MOCK_DEVELOPMENT_PROFILE);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.warn("Supabase session initialization note:", err);
        if (mounted && !isSupabaseConfigured) {
          setUser(MOCK_DEVELOPMENT_USER);
          setProfile(MOCK_DEVELOPMENT_PROFILE);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    try {
      const {
        data: { subscription },
      } = onAuthStateChange(async (_event, currentSession) => {
        if (mounted) {
          setSession(currentSession);
          if (currentSession?.user) {
            setUser(currentSession.user);
            fetchProfile(currentSession.user.id);
          } else if (!isSupabaseConfigured) {
            setUser(MOCK_DEVELOPMENT_USER);
            setProfile(MOCK_DEVELOPMENT_PROFILE);
          } else {
            setUser(null);
            setProfile(null);
          }
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      await authSignOut();
    } catch (err) {
      console.warn("SignOut warning:", err);
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const signIn = async (params: SignInParams) => {
    const result = await authSignIn(params);
    if (result.session?.user) {
      setUser(result.session.user);
      setSession(result.session);
      await fetchProfile(result.session.user.id);
    }
    return result;
  };

  const signUp = async (params: SignUpParams) => {
    const result = await authSignUp(params);
    if (result.session?.user) {
      setUser(result.session.user);
      setSession(result.session);
      await fetchProfile(result.session.user.id);
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
        isConfigured: isSupabaseConfigured,
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
