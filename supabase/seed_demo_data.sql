-- ==============================================================================
-- GlobeTrotter AI - Comprehensive Demo Dataset Seed Script
-- File: supabase/seed_demo_data.sql
-- Description: Idempotent demo dataset populating Trips, Stops, Stop Activities,
--              and Expenses using existing seeded Cities and Activities.
-- ==============================================================================

DO $$
DECLARE
  demo_user_id UUID;
  
  -- Trip UUIDs
  trip1_id UUID := 't0000000-0000-0000-0000-000000000001';
  trip2_id UUID := 't0000000-0000-0000-0000-000000000002';
  trip3_id UUID := 't0000000-0000-0000-0000-000000000003';

  -- Stop UUIDs
  t1_stop1 UUID := 's0000000-0000-0000-0001-000000000001';
  t1_stop2 UUID := 's0000000-0000-0000-0001-000000000002';
  t2_stop1 UUID := 's0000000-0000-0000-0002-000000000001';
  t3_stop1 UUID := 's0000000-0000-0000-0003-000000000001';
  t3_stop2 UUID := 's0000000-0000-0000-0003-000000000002';

  -- City IDs resolved from database
  delhi_id UUID;
  jaipur_id UUID;
  goa_id UUID;
  ahmedabad_id UUID;
  mumbai_id UUID;

  -- Activity IDs resolved from database
  act_delhi_rickshaw UUID;
  act_delhi_humayun UUID;
  act_delhi_sunset UUID;
  act_jaipur_amer UUID;
  act_jaipur_hawa UUID;
  act_jaipur_thali UUID;
  act_jaipur_bazaar UUID;

  act_goa_churches UUID;
  act_goa_latin UUID;
  act_goa_waterfall UUID;
  act_goa_spice UUID;

  act_ahm_ashram UUID;
  act_ahm_adalaj UUID;
  act_ahm_manek UUID;
  act_mum_gateway UUID;
  act_mum_marine UUID;
  act_mum_irani UUID;

BEGIN
  -- 1. Identify Target User ID (First authenticated user in auth.users, or fallback)
  SELECT id INTO demo_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;

  IF demo_user_id IS NULL THEN
    -- If no user is in auth.users, use a fixed demo UUID
    demo_user_id := '00000000-0000-0000-0000-000000000000';
    RAISE NOTICE 'No auth user found in auth.users. Using fallback user ID %', demo_user_id;
  ELSE
    RAISE NOTICE 'Attaching demo trips to authenticated user ID %', demo_user_id;
  END IF;

  -- 2. Resolve City IDs
  SELECT id INTO delhi_id FROM public.cities WHERE name ILIKE 'Delhi' LIMIT 1;
  SELECT id INTO jaipur_id FROM public.cities WHERE name ILIKE 'Jaipur' LIMIT 1;
  SELECT id INTO goa_id FROM public.cities WHERE name ILIKE 'Goa' LIMIT 1;
  SELECT id INTO ahmedabad_id FROM public.cities WHERE name ILIKE 'Ahmedabad' LIMIT 1;
  SELECT id INTO mumbai_id FROM public.cities WHERE name ILIKE 'Mumbai' LIMIT 1;

  -- 3. Resolve Activity IDs
  SELECT id INTO act_delhi_rickshaw FROM public.activities WHERE city_id = delhi_id AND title ILIKE '%Rickshaw%' LIMIT 1;
  SELECT id INTO act_delhi_humayun FROM public.activities WHERE city_id = delhi_id AND title ILIKE '%Humayun%' LIMIT 1;
  SELECT id INTO act_delhi_sunset FROM public.activities WHERE city_id = delhi_id AND title ILIKE '%Hauz Khas%' LIMIT 1;

  SELECT id INTO act_jaipur_amer FROM public.activities WHERE city_id = jaipur_id AND title ILIKE '%Amer Fort%' LIMIT 1;
  SELECT id INTO act_jaipur_hawa FROM public.activities WHERE city_id = jaipur_id AND title ILIKE '%Hawa Mahal%' LIMIT 1;
  SELECT id INTO act_jaipur_thali FROM public.activities WHERE city_id = jaipur_id AND title ILIKE '%Chokhi Dhani%' LIMIT 1;
  SELECT id INTO act_jaipur_bazaar FROM public.activities WHERE city_id = jaipur_id AND title ILIKE '%Johari Bazaar%' LIMIT 1;

  SELECT id INTO act_goa_churches FROM public.activities WHERE city_id = goa_id AND title ILIKE '%Churches%' LIMIT 1;
  SELECT id INTO act_goa_latin FROM public.activities WHERE city_id = goa_id AND title ILIKE '%Fontainhas%' LIMIT 1;
  SELECT id INTO act_goa_waterfall FROM public.activities WHERE city_id = goa_id AND title ILIKE '%Dudhsagar%' LIMIT 1;
  SELECT id INTO act_goa_spice FROM public.activities WHERE city_id = goa_id AND title ILIKE '%Spice Plantation%' LIMIT 1;

  SELECT id INTO act_ahm_ashram FROM public.activities WHERE city_id = ahmedabad_id AND title ILIKE '%Gandhi Ashram%' LIMIT 1;
  SELECT id INTO act_ahm_adalaj FROM public.activities WHERE city_id = ahmedabad_id AND title ILIKE '%Adalaj%' LIMIT 1;
  SELECT id INTO act_ahm_manek FROM public.activities WHERE city_id = ahmedabad_id AND title ILIKE '%Manek Chowk%' LIMIT 1;

  SELECT id INTO act_mum_gateway FROM public.activities WHERE city_id = mumbai_id AND title ILIKE '%Gateway of India%' LIMIT 1;
  SELECT id INTO act_mum_marine FROM public.activities WHERE city_id = mumbai_id AND title ILIKE '%Marine Drive%' LIMIT 1;
  SELECT id INTO act_mum_irani FROM public.activities WHERE city_id = mumbai_id AND title ILIKE '%Irani Cafe%' LIMIT 1;

  -- 4. Clean up previous demo trips if rerun
  DELETE FROM public.trips WHERE id IN (trip1_id, trip2_id, trip3_id) OR share_slug IN ('rajasthan-royal-heritage', 'goa-beachside-getaway', 'mumbai-ahmedabad-cultural-tour');

  -- ============================================================================
  -- 5. Insert Trips
  -- ============================================================================

  -- Trip 1: UPCOMING & PUBLIC (Delhi -> Jaipur)
  INSERT INTO public.trips (
    id, user_id, title, description, start_date, end_date, target_budget,
    cover_image_url, is_public, share_slug, created_at, updated_at
  ) VALUES (
    trip1_id,
    demo_user_id,
    'Rajasthan Royal Heritage & Desert Forts',
    'A royal journey through the majestic palaces of Jaipur and the historic monuments of Delhi with authentic Rajasthani dining and cultural walks.',
    (CURRENT_DATE + INTERVAL '14 days')::DATE,
    (CURRENT_DATE + INTERVAL '21 days')::DATE,
    2400.00,
    'https://images.unsplash.com/photo-1603288940300-349f2b86ec32?w=800&auto=format&fit=crop&q=80',
    true,
    'rajasthan-royal-heritage',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- Trip 2: ONGOING (Goa Beachside)
  INSERT INTO public.trips (
    id, user_id, title, description, start_date, end_date, target_budget,
    cover_image_url, is_public, share_slug, created_at, updated_at
  ) VALUES (
    trip2_id,
    demo_user_id,
    'Golden Sands & Spice Coast: Goa Beachside',
    'Tropical relaxation along the Arabian sea featuring heritage Portuguese villas, waterfall safaris, and coastal seafood.',
    (CURRENT_DATE - INTERVAL '2 days')::DATE,
    (CURRENT_DATE + INTERVAL '4 days')::DATE,
    1800.00,
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    false,
    'goa-beachside-getaway',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- Trip 3: COMPLETED / PAST (Ahmedabad -> Mumbai)
  INSERT INTO public.trips (
    id, user_id, title, description, start_date, end_date, target_budget,
    cover_image_url, is_public, share_slug, created_at, updated_at
  ) VALUES (
    trip3_id,
    demo_user_id,
    'Mumbai & Ahmedabad Cultural Explorer',
    'An immersive cultural tour exploring UNESCO heritage architecture in Ahmedabad and the colonial art deco boulevards of Mumbai.',
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    (CURRENT_DATE - INTERVAL '22 days')::DATE,
    1500.00,
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    false,
    'mumbai-ahmedabad-cultural-tour',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- ============================================================================
  -- 6. Insert Stops
  -- ============================================================================

  -- Trip 1 Stops
  INSERT INTO public.stops (id, trip_id, city_id, stop_order, arrival_date, departure_date) VALUES
    (t1_stop1, trip1_id, delhi_id, 0, (CURRENT_DATE + INTERVAL '14 days')::DATE, (CURRENT_DATE + INTERVAL '17 days')::DATE),
    (t1_stop2, trip1_id, jaipur_id, 1, (CURRENT_DATE + INTERVAL '17 days')::DATE, (CURRENT_DATE + INTERVAL '21 days')::DATE);

  -- Trip 2 Stop
  INSERT INTO public.stops (id, trip_id, city_id, stop_order, arrival_date, departure_date) VALUES
    (t2_stop1, trip2_id, goa_id, 0, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '4 days')::DATE);

  -- Trip 3 Stops
  INSERT INTO public.stops (id, trip_id, city_id, stop_order, arrival_date, departure_date) VALUES
    (t3_stop1, trip3_id, ahmedabad_id, 0, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE - INTERVAL '26 days')::DATE),
    (t3_stop2, trip3_id, mumbai_id, 1, (CURRENT_DATE - INTERVAL '26 days')::DATE, (CURRENT_DATE - INTERVAL '22 days')::DATE);

  -- ============================================================================
  -- 7. Insert Stop Activities
  -- ============================================================================

  -- Trip 1, Stop 1 (Delhi)
  INSERT INTO public.stop_activities (stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed) VALUES
    (t1_stop1, act_delhi_rickshaw, 1, '09:30:00', 14.00, 'Meet rickshaw driver at Chandni Chowk metro gate 3.', false),
    (t1_stop1, act_delhi_humayun, 2, '14:00:00', 8.00, 'Pre-book online tickets to skip queue.', false),
    (t1_stop1, act_delhi_sunset, 2, '18:30:00', 22.00, 'Rooftop table reserved overlooking Hauz Khas reservoir.', false);

  -- Trip 1, Stop 2 (Jaipur)
  INSERT INTO public.stop_activities (stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed) VALUES
    (t1_stop2, act_jaipur_amer, 4, '10:00:00', 10.00, 'Guided expedition inside Sheesh Mahal.', false),
    (t1_stop2, act_jaipur_hawa, 5, '09:00:00', 12.00, 'Best early morning golden light for photography.', false),
    (t1_stop2, act_jaipur_thali, 5, '19:30:00', 20.00, 'Authentic Rajasthani village fair and dal baati feast.', false),
    (t1_stop2, act_jaipur_bazaar, 6, '15:00:00', 5.00, 'Gemstones, block prints, and blue pottery.', false);

  -- Trip 2, Stop 1 (Goa)
  INSERT INTO public.stop_activities (stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed) VALUES
    (t2_stop1, act_goa_churches, 1, '10:00:00', 2.00, 'Visit Basilica of Bom Jesus relics.', true),
    (t2_stop1, act_goa_latin, 2, '16:30:00', 8.00, 'Explore pastel Portuguese architecture in Fontainhas.', true),
    (t2_stop1, act_goa_waterfall, 3, '08:30:00', 35.00, '4x4 jungle jeep safari through wildlife sanctuary.', false),
    (t2_stop1, act_goa_spice, 4, '11:00:00', 15.00, 'Traditional Goan fish curry buffet on banana leaves.', false);

  -- Trip 3, Stop 1 (Ahmedabad)
  INSERT INTO public.stop_activities (stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed) VALUES
    (t3_stop1, act_ahm_ashram, 1, '09:30:00', 0.00, 'Peaceful morning walk at Gandhi Ashram on Sabarmati.', true),
    (t3_stop1, act_ahm_adalaj, 2, '10:00:00', 1.00, 'Subterranean 5-story Solanki architecture.', true),
    (t3_stop1, act_ahm_manek, 2, '22:00:00', 10.00, 'Midnight street food safari.', true);

  -- Trip 3, Stop 2 (Mumbai)
  INSERT INTO public.stop_activities (stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed) VALUES
    (t3_stop2, act_mum_gateway, 5, '09:00:00', 15.00, 'Ferry ride to Elephanta caves.', true),
    (t3_stop2, act_mum_marine, 5, '17:30:00', 0.00, 'Sunset stroll along Queen''s Necklace.', true),
    (t3_stop2, act_mum_irani, 6, '11:00:00', 18.00, 'Bun maska, berry pulao, and Irani chai.', true);

  -- ============================================================================
  -- 8. Insert Expenses
  -- ============================================================================

  -- Trip 1 Expenses (Rajasthan)
  INSERT INTO public.expenses (trip_id, stop_id, category, amount, currency, description, date) VALUES
    (trip1_id, t1_stop1, 'Transport', 85.00, 'USD', 'Delhi to Jaipur AC Superfast Train Tickets', (CURRENT_DATE + INTERVAL '17 days')::DATE),
    (trip1_id, t1_stop2, 'Accommodation', 450.00, 'USD', 'Jaipur Heritage Haveli (4 nights)', (CURRENT_DATE + INTERVAL '17 days')::DATE),
    (trip1_id, t1_stop1, 'Food', 40.00, 'USD', 'Welcome Dinner in Connaught Place', (CURRENT_DATE + INTERVAL '14 days')::DATE),
    (trip1_id, t1_stop2, 'Transport', 35.00, 'USD', 'Local Auto & Cab Rides across Forts', (CURRENT_DATE + INTERVAL '18 days')::DATE);

  -- Trip 2 Expenses (Goa)
  INSERT INTO public.expenses (trip_id, stop_id, category, amount, currency, description, date) VALUES
    (trip2_id, t2_stop1, 'Accommodation', 380.00, 'USD', 'Boutique Beach Resort Booking', (CURRENT_DATE - INTERVAL '2 days')::DATE),
    (trip2_id, t2_stop1, 'Transport', 30.00, 'USD', 'Scooty Rental & Fuel', (CURRENT_DATE - INTERVAL '1 days')::DATE),
    (trip2_id, t2_stop1, 'Food', 28.00, 'USD', 'Sunset Beach Shack Seafood Dinner', (CURRENT_DATE - INTERVAL '1 days')::DATE);

  -- Trip 3 Expenses (Mumbai & Ahmedabad)
  INSERT INTO public.expenses (trip_id, stop_id, category, amount, currency, description, date) VALUES
    (trip3_id, t3_stop1, 'Transport', 45.00, 'USD', 'Vande Bharat Express (Ahmedabad to Mumbai)', (CURRENT_DATE - INTERVAL '26 days')::DATE),
    (trip3_id, t3_stop2, 'Accommodation', 320.00, 'USD', 'South Mumbai Art Deco Hotel', (CURRENT_DATE - INTERVAL '26 days')::DATE),
    (trip3_id, t3_stop1, 'Accommodation', 180.00, 'USD', 'Ahmedabad Heritage Stay', (CURRENT_DATE - INTERVAL '30 days')::DATE),
    (trip3_id, t3_stop2, 'Food', 75.00, 'USD', 'Colaba & Fort Fine Dining', (CURRENT_DATE - INTERVAL '24 days')::DATE),
    (trip3_id, t3_stop2, 'Activities', 30.00, 'USD', 'Museum & Gallery Entry Passes', (CURRENT_DATE - INTERVAL '25 days')::DATE);

  RAISE NOTICE 'Demo dataset successfully populated!';
END $$;
