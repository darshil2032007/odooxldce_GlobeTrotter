-- ==============================================================================
-- GlobeTrotter AI - Database Schema Migration
-- Migration: 20260822000001_create_schema.sql
-- Description: Core tables, foreign keys, constraints, indexes, and triggers.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- Helper Functions
-- ==============================================================================

-- Function to automatically update updated_at timestamp on row modification
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- Table: profiles
-- User profiles extending auth.users
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to automatically create profile row when new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = CASE WHEN EXCLUDED.full_name <> '' THEN EXCLUDED.full_name ELSE public.profiles.full_name END,
    avatar_url = CASE WHEN EXCLUDED.avatar_url <> '' THEN EXCLUDED.avatar_url ELSE public.profiles.avatar_url END,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS handle_profiles_updated_at ON public.profiles;
CREATE TRIGGER handle_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: cities
-- Global and domestic travel destinations catalog
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  cost_index NUMERIC(4, 2) NOT NULL DEFAULT 3.0,
  popularity_score NUMERIC(4, 2) NOT NULL DEFAULT 4.0,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS cities_name_idx ON public.cities(name);
CREATE INDEX IF NOT EXISTS cities_country_idx ON public.cities(country);
CREATE INDEX IF NOT EXISTS cities_popularity_score_idx ON public.cities(popularity_score DESC);

DROP TRIGGER IF EXISTS handle_cities_updated_at ON public.cities;
CREATE TRIGGER handle_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: activities
-- Curated activities associated with cities
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  estimated_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  duration_hours NUMERIC(4, 1) NOT NULL DEFAULT 1.0,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS activities_city_id_idx ON public.activities(city_id);
CREATE INDEX IF NOT EXISTS activities_category_idx ON public.activities(category);
CREATE INDEX IF NOT EXISTS activities_estimated_cost_idx ON public.activities(estimated_cost);

DROP TRIGGER IF EXISTS handle_activities_updated_at ON public.activities;
CREATE TRIGGER handle_activities_updated_at
  BEFORE UPDATE ON public.activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: trips
-- User travel itineraries
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  target_budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  cover_image_url TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  share_slug TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT trips_valid_dates CHECK (end_date >= start_date),
  CONSTRAINT trips_valid_budget CHECK (target_budget >= 0)
);

CREATE INDEX IF NOT EXISTS trips_user_id_idx ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS trips_share_slug_idx ON public.trips(share_slug);
CREATE INDEX IF NOT EXISTS trips_is_public_idx ON public.trips(is_public);
CREATE INDEX IF NOT EXISTS trips_start_date_idx ON public.trips(start_date ASC);
CREATE INDEX IF NOT EXISTS trips_created_at_idx ON public.trips(created_at DESC);

DROP TRIGGER IF EXISTS handle_trips_updated_at ON public.trips;
CREATE TRIGGER handle_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: stops
-- City stops inside a trip
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE RESTRICT,
  stop_order INTEGER NOT NULL DEFAULT 0,
  arrival_date DATE,
  departure_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stops_valid_dates CHECK (departure_date IS NULL OR arrival_date IS NULL OR departure_date >= arrival_date),
  CONSTRAINT stops_valid_order CHECK (stop_order >= 0)
);

CREATE INDEX IF NOT EXISTS stops_trip_id_idx ON public.stops(trip_id);
CREATE INDEX IF NOT EXISTS stops_city_id_idx ON public.stops(city_id);
CREATE INDEX IF NOT EXISTS stops_trip_order_idx ON public.stops(trip_id, stop_order ASC);

DROP TRIGGER IF EXISTS handle_stops_updated_at ON public.stops;
CREATE TRIGGER handle_stops_updated_at
  BEFORE UPDATE ON public.stops
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: stop_activities
-- Scheduled activities assigned to a specific stop
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.stop_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id UUID NOT NULL REFERENCES public.stops(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  day_number INTEGER NOT NULL DEFAULT 1,
  scheduled_time TIME,
  cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  notes TEXT,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT stop_activities_valid_day CHECK (day_number >= 1),
  CONSTRAINT stop_activities_valid_cost CHECK (cost >= 0)
);

CREATE INDEX IF NOT EXISTS stop_activities_stop_id_idx ON public.stop_activities(stop_id);
CREATE INDEX IF NOT EXISTS stop_activities_activity_id_idx ON public.stop_activities(activity_id);
CREATE INDEX IF NOT EXISTS stop_activities_day_number_idx ON public.stop_activities(stop_id, day_number ASC);

DROP TRIGGER IF EXISTS handle_stop_activities_updated_at ON public.stop_activities;
CREATE TRIGGER handle_stop_activities_updated_at
  BEFORE UPDATE ON public.stop_activities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- Table: expenses
-- Trip expense tracker
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  stop_id UUID REFERENCES public.stops(id) ON DELETE SET NULL,
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT expenses_valid_amount CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS expenses_trip_id_idx ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS expenses_stop_id_idx ON public.expenses(stop_id);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON public.expenses(category);

DROP TRIGGER IF EXISTS handle_expenses_updated_at ON public.expenses;
CREATE TRIGGER handle_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
