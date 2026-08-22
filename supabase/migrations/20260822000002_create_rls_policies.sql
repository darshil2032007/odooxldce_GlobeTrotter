-- ==============================================================================
-- GlobeTrotter AI - Row Level Security (RLS) Migration
-- Migration: 20260822000002_create_rls_policies.sql
-- Description: Enable RLS and define robust security policies for all tables.
-- ==============================================================================

-- ==============================================================================
-- 1. Enable RLS on all tables
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stop_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 2. Profiles Policies
-- ==============================================================================
-- Any authenticated or anonymous user can view profiles (useful for trip author info)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==============================================================================
-- 3. Cities Policies (Public Catalog Read-Only)
-- ==============================================================================
-- Public catalog: Anyone (anon or authenticated) can view cities
CREATE POLICY "Cities are viewable by everyone"
  ON public.cities
  FOR SELECT
  USING (true);

-- Modification only permitted by service_role (default behavior when no write policy exists for anon/auth)

-- ==============================================================================
-- 4. Activities Policies (Public Catalog Read-Only)
-- ==============================================================================
-- Public catalog: Anyone (anon or authenticated) can view activities
CREATE POLICY "Activities are viewable by everyone"
  ON public.activities
  FOR SELECT
  USING (true);

-- Modification only permitted by service_role

-- ==============================================================================
-- 5. Trips Policies
-- ==============================================================================
-- View trips: Owner can view, OR anyone can view if trip is marked is_public
CREATE POLICY "Users can view their own trips or public trips"
  ON public.trips
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- Insert trips: Authenticated users can create trips with their own user_id
CREATE POLICY "Users can create their own trips"
  ON public.trips
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update trips: Only the trip owner can update
CREATE POLICY "Users can update their own trips"
  ON public.trips
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete trips: Only the trip owner can delete
CREATE POLICY "Users can delete their own trips"
  ON public.trips
  FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. Stops Policies
-- ==============================================================================
-- View stops: Allowed if the parent trip belongs to the user OR is public
CREATE POLICY "Users can view stops for their own or public trips"
  ON public.stops
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id
        AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

-- Insert stops: Allowed if the user owns the parent trip
CREATE POLICY "Users can insert stops for their own trips"
  ON public.stops
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Update stops: Allowed if the user owns the parent trip
CREATE POLICY "Users can update stops for their own trips"
  ON public.stops
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id
        AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Delete stops: Allowed if the user owns the parent trip
CREATE POLICY "Users can delete stops for their own trips"
  ON public.stops
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = stops.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 7. Stop Activities Policies
-- ==============================================================================
-- View stop activities: Allowed if the parent trip belongs to the user OR is public
CREATE POLICY "Users can view stop activities for their own or public trips"
  ON public.stop_activities
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = stop_activities.stop_id
        AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

-- Insert stop activities: Allowed if the user owns the parent trip
CREATE POLICY "Users can insert stop activities for their own trips"
  ON public.stop_activities
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = stop_activities.stop_id
        AND trips.user_id = auth.uid()
    )
  );

-- Update stop activities: Allowed if the user owns the parent trip
CREATE POLICY "Users can update stop activities for their own trips"
  ON public.stop_activities
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = stop_activities.stop_id
        AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = stop_activities.stop_id
        AND trips.user_id = auth.uid()
    )
  );

-- Delete stop activities: Allowed if the user owns the parent trip
CREATE POLICY "Users can delete stop activities for their own trips"
  ON public.stop_activities
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.stops
      JOIN public.trips ON trips.id = stops.trip_id
      WHERE stops.id = stop_activities.stop_id
        AND trips.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 8. Expenses Policies
-- ==============================================================================
-- View expenses: Allowed if the parent trip belongs to the user OR is public
CREATE POLICY "Users can view expenses for their own or public trips"
  ON public.expenses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND (trips.user_id = auth.uid() OR trips.is_public = true)
    )
  );

-- Insert expenses: Allowed if the user owns the parent trip
CREATE POLICY "Users can insert expenses for their own trips"
  ON public.expenses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Update expenses: Allowed if the user owns the parent trip
CREATE POLICY "Users can update expenses for their own trips"
  ON public.expenses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Delete expenses: Allowed if the user owns the parent trip
CREATE POLICY "Users can delete expenses for their own trips"
  ON public.expenses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );
