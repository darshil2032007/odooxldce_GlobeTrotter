import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

// Mock user for UI development when no active Supabase session exists
const MOCK_DEVELOPMENT_USER: User = {
  id: "dev-user-123",
  app_metadata: {},
  user_metadata: { full_name: "Alex Traveler" },
  aud: "authenticated",
  created_at: new Date().toISOString(),
  email: "alex.traveler@example.com",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(MOCK_DEVELOPMENT_USER);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          } else {
            // Keep MOCK_DEVELOPMENT_USER for instant UI preview inside shell routes
            setUser(MOCK_DEVELOPMENT_USER);
          }
        }
      } catch (err) {
        console.warn("Supabase auth session fetch error (using dev user fallback):", err);
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
      } = supabase.auth.onAuthStateChange((_event, s) => {
        if (mounted) {
          setSession(s);
          setUser(s?.user ?? MOCK_DEVELOPMENT_USER);
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
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("SignOut warning:", err);
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
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
