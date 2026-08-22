import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Profile, ProfileUpdate } from "@/types/database";
import { getUserProfile, updateUserProfile } from "@/services/auth/authService";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export const profileKeys = {
  all: ["profile"] as const,
  detail: (userId?: string | null) => ["profile", userId] as const,
};

export const MOCK_DEVELOPMENT_PROFILE: Profile = {
  id: "dev-user-123",
  email: "alex.traveler@example.com",
  full_name: "Alex Traveler",
  avatar_url:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Hook to fetch and cache user profile using TanStack Query.
 * Runs only when a valid userId exists and deduplicates requests.
 */
export function useProfile(userId?: string | null) {
  return useQuery<Profile | null>({
    queryKey: profileKeys.detail(userId),
    queryFn: async () => {
      if (!userId) return null;
      if (!isSupabaseConfigured) return MOCK_DEVELOPMENT_PROFILE;
      const data = await getUserProfile(userId);
      return data;
    },
    enabled: Boolean(userId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to update user profile with optimistic/cache invalidation.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: ProfileUpdate;
    }) => {
      return await updateUserProfile(userId, updates);
    },
    onSuccess: (updatedProfile, variables) => {
      queryClient.setQueryData(profileKeys.detail(variables.userId), updatedProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(variables.userId) });
    },
  });
}
