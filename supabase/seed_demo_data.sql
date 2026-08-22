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
  trip4_id UUID := 't0000000-0000-0000-0000-000000000004';
  trip5_id UUID := 't0000000-0000-0000-0000-000000000005';

  -- Stop UUIDs
  t1_stop1 UUID := 's0000000-0000-0000-0001-000000000001';
  t1_stop2 UUID := 's0000000-0000-0000-0001-000000000002';
  t2_stop1 UUID := 's0000000-0000-0000-0002-000000000001';
  t3_stop1 UUID := 's0000000-0000-0000-0003-000000000001';
  t3_stop2 UUID := 's0000000-0000-0000-0003-000000000002';
  t4_stop1 UUID := 's0000000-0000-0000-0004-000000000001';
  t5_stop1 UUID := 's0000000-0000-0000-0005-000000000001';

  -- City IDs resolved from database
  delhi_id UUID;
  jaipur_id UUID;
  goa_id UUID;
  ahmedabad_id UUID;
  mumbai_id UUID;
  manali_id UUID;
  bangalore_id UUID;

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

  act_manali_paraglide UUID;
  act_manali_rohtang UUID;
  act_manali_cafe UUID;
  act_manali_hadimba UUID;

  act_blr_lalbagh UUID;
  act_blr_brewery UUID;
  act_blr_palace UUID;
  act_blr_tiffin UUID;

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
  SELECT id INTO manali_id FROM public.cities WHERE name ILIKE 'Manali' LIMIT 1;
  SELECT id INTO bangalore_id FROM public.cities WHERE name ILIKE 'Bangalore' LIMIT 1;

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

  SELECT id INTO act_manali_paraglide FROM public.activities WHERE city_id = manali_id AND title ILIKE '%Paragliding%' LIMIT 1;
  SELECT id INTO act_manali_rohtang FROM public.activities WHERE city_id = manali_id AND title ILIKE '%Rohtang%' LIMIT 1;
  SELECT id INTO act_manali_cafe FROM public.activities WHERE city_id = manali_id AND title ILIKE '%Cafe Culture%' LIMIT 1;
  SELECT id INTO act_manali_hadimba FROM public.activities WHERE city_id = manali_id AND title ILIKE '%Hadimba%' LIMIT 1;

  SELECT id INTO act_blr_lalbagh FROM public.activities WHERE city_id = bangalore_id AND title ILIKE '%Lalbagh%' LIMIT 1;
  SELECT id INTO act_blr_brewery FROM public.activities WHERE city_id = bangalore_id AND title ILIKE '%Microbrewery%' LIMIT 1;
  SELECT id INTO act_blr_palace FROM public.activities WHERE city_id = bangalore_id AND title ILIKE '%Palace%' LIMIT 1;
  SELECT id INTO act_blr_tiffin FROM public.activities WHERE city_id = bangalore_id AND title ILIKE '%Tiffin%' LIMIT 1;

  -- 4. Clean up previous demo trips if rerun
  DELETE FROM public.trips WHERE id IN (trip1_id, trip2_id, trip3_id, trip4_id, trip5_id) OR share_slug IN (
    'rajasthan-royal-heritage',
    'goa-beachside-getaway',
    'mumbai-ahmedabad-cultural-tour',
    'himalayan-alpine-manali',
    'bangalore-heritage-garden-trails'
  );

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
    'https://unsplash.com/photos/uADXI1v10us/download?w=800',
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
    'Cultural Crossroads: Mumbai & Ahmedabad Explorer',
    'Retrace western India''s architectural heritage from stepwells to Art Deco promenades.',
    (CURRENT_DATE - INTERVAL '30 days')::DATE,
    (CURRENT_DATE - INTERVAL '22 days')::DATE,
    2100.00,
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    false,
    'mumbai-ahmedabad-cultural-tour',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- Trip 4: UPCOMING & PUBLIC (Manali & Solang Valley)
  INSERT INTO public.trips (
    id, user_id, title, description, start_date, end_date, target_budget,
    cover_image_url, is_public, share_slug, created_at, updated_at
  ) VALUES (
    trip4_id,
    demo_user_id,
    'Himalayan Alpine Wonderland: Manali & Solang Valley',
    'High-altitude adventure through snowy mountain passes, apple orchards, Solang Valley paragliding, and historic wooden temples.',
    (CURRENT_DATE + INTERVAL '28 days')::DATE,
    (CURRENT_DATE + INTERVAL '34 days')::DATE,
    1400.00,
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    true,
    'himalayan-alpine-manali',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- Trip 5: UPCOMING & PUBLIC (Bangalore Explorer)
  INSERT INTO public.trips (
    id, user_id, title, description, start_date, end_date, target_budget,
    cover_image_url, is_public, share_slug, created_at, updated_at
  ) VALUES (
    trip5_id,
    demo_user_id,
    'Silicon Garden & Heritage Trails: Bangalore Explorer',
    'Experience Bangalore''s legendary lush botanical gardens, vintage breakfast tiffin rooms in Malleshwaram, and vibrant microbrewery hubs.',
    (CURRENT_DATE + INTERVAL '42 days')::DATE,
    (CURRENT_DATE + INTERVAL '47 days')::DATE,
    1100.00,
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
    true,
    'bangalore-heritage-garden-trails',
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

  -- ============================================================================
  -- 6. Insert Stops
  -- ============================================================================

  INSERT INTO public.stops (id, trip_id, city_id, stop_order, arrival_date, departure_date, created_at, updated_at) VALUES
    (t1_stop1, trip1_id, delhi_id, 0, (CURRENT_DATE + INTERVAL '14 days')::DATE, (CURRENT_DATE + INTERVAL '17 days')::DATE, now(), now()),
    (t1_stop2, trip1_id, jaipur_id, 1, (CURRENT_DATE + INTERVAL '17 days')::DATE, (CURRENT_DATE + INTERVAL '21 days')::DATE, now(), now()),
    (t2_stop1, trip2_id, goa_id, 0, (CURRENT_DATE - INTERVAL '2 days')::DATE, (CURRENT_DATE + INTERVAL '4 days')::DATE, now(), now()),
    (t3_stop1, trip3_id, ahmedabad_id, 0, (CURRENT_DATE - INTERVAL '30 days')::DATE, (CURRENT_DATE - INTERVAL '26 days')::DATE, now(), now()),
    (t3_stop2, trip3_id, mumbai_id, 1, (CURRENT_DATE - INTERVAL '26 days')::DATE, (CURRENT_DATE - INTERVAL '22 days')::DATE, now(), now()),
    (t4_stop1, trip4_id, manali_id, 0, (CURRENT_DATE + INTERVAL '28 days')::DATE, (CURRENT_DATE + INTERVAL '34 days')::DATE, now(), now()),
    (t5_stop1, trip5_id, bangalore_id, 0, (CURRENT_DATE + INTERVAL '42 days')::DATE, (CURRENT_DATE + INTERVAL '47 days')::DATE, now(), now());

  -- ============================================================================
  -- 7. Insert Scheduled Stop Activities
  -- ============================================================================

  INSERT INTO public.stop_activities (id, stop_id, activity_id, day_number, scheduled_time, cost, notes, is_completed, created_at, updated_at) VALUES
    -- Trip 1 (Delhi + Jaipur)
    ('sa000000-0000-0000-0001-000000000001', t1_stop1, act_delhi_rickshaw, 1, '09:30', 14.00, 'Meet rickshaw driver at Chandni Chowk metro gate 3.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000002', t1_stop1, act_delhi_humayun, 2, '14:00', 8.00, 'Pre-book online tickets to skip queue.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000003', t1_stop1, act_delhi_sunset, 3, '17:30', 0.00, 'Sunset picnic overlooking the lawns.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000004', t1_stop2, act_jaipur_amer, 4, '08:30', 7.00, 'Early morning jeep to avoid elephant rush.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000005', t1_stop2, act_jaipur_hawa, 5, '10:00', 4.00, 'Rooftop photography from Wind View Cafe.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000006', t1_stop2, act_jaipur_thali, 5, '19:30', 18.00, 'Traditional Gatte ki Sabzi and Dal Baati Churma.', false, now(), now()),
    ('sa000000-0000-0000-0001-000000000007', t1_stop2, act_jaipur_bazaar, 6, '15:00', 0.00, 'Shop for blue pottery, block print textiles, and mojris.', false, now(), now()),

    -- Trip 2 (Goa)
    ('sa000000-0000-0000-0002-000000000001', t2_stop1, act_goa_churches, 1, '10:00', 2.00, 'Dress respectfully with covered shoulders.', true, now(), now()),
    ('sa000000-0000-0000-0002-000000000002', t2_stop1, act_goa_latin, 2, '16:30', 8.00, 'Explore colorful Portuguese alleys and art cafes.', true, now(), now()),
    ('sa000000-0000-0000-0002-000000000003', t2_stop1, act_goa_waterfall, 3, '07:00', 35.00, 'Full day 4x4 jungle jeep safari.', false, now(), now()),
    ('sa000000-0000-0000-0002-000000000004', t2_stop1, act_goa_spice, 4, '12:00', 15.00, 'Authentic Goan buffet on banana leaves.', false, now(), now()),

    -- Trip 3 (Ahmedabad + Mumbai)
    ('sa000000-0000-0000-0003-000000000001', t3_stop1, act_ahm_ashram, 1, '09:30', 0.00, 'Peaceful morning walk at Gandhi Ashram on Sabarmati.', true, now(), now()),
    ('sa000000-0000-0000-0003-000000000002', t3_stop1, act_ahm_adalaj, 2, '10:00', 1.00, 'Subterranean 5-story Solanki architecture.', true, now(), now()),
    ('sa000000-0000-0000-0003-000000000003', t3_stop1, act_ahm_manek, 3, '21:00', 5.00, 'Night market street food tour.', true, now(), now()),
    ('sa000000-0000-0000-0003-000000000004', t3_stop2, act_mum_gateway, 5, '09:00', 0.00, 'Gateway of India & Taj Mahal Palace exterior walk.', true, now(), now()),
    ('sa000000-0000-0000-0003-000000000005', t3_stop2, act_mum_irani, 6, '08:30', 4.00, 'Brun Maska, Bun Maska Chai at Kyani & Co.', true, now(), now()),
    ('sa000000-0000-0000-0003-000000000006', t3_stop2, act_mum_marine, 7, '17:30', 0.00, 'Sunset promenade walk along Queen''s Necklace.', true, now(), now()),

    -- Trip 4 (Manali)
    ('sa000000-0000-0000-0004-000000000001', t4_stop1, act_manali_paraglide, 1, '10:00', 40.00, 'Tandem paragliding flight over Solang Valley with GoPro footage.', false, now(), now()),
    ('sa000000-0000-0000-0004-000000000002', t4_stop1, act_manali_rohtang, 2, '07:30', 30.00, 'Drive through Atal Tunnel to high altitude glaciers at Rohtang Pass.', false, now(), now()),
    ('sa000000-0000-0000-0004-000000000003', t4_stop1, act_manali_cafe, 3, '18:00', 15.00, 'Wood-fired trout dinner with acoustic mountain music in Old Manali.', false, now(), now()),
    ('sa000000-0000-0000-0004-000000000004', t4_stop1, act_manali_hadimba, 4, '11:00', 1.00, 'Historic 1553 pagoda wood temple in deodar cedar forest.', false, now(), now()),

    -- Trip 5 (Bangalore)
    ('sa000000-0000-0000-0005-000000000001', t5_stop1, act_blr_lalbagh, 1, '07:30', 2.00, 'Morning walking tour of the 240-acre garden and Glass House.', false, now(), now()),
    ('sa000000-0000-0000-0005-000000000002', t5_stop1, act_blr_tiffin, 2, '08:30', 6.00, 'Crispy butter dosas & filter coffee at legendary Malleshwaram eateries.', false, now(), now()),
    ('sa000000-0000-0000-0005-000000000003', t5_stop1, act_blr_palace, 3, '11:00', 6.00, 'Tudor-style wooden carvings & royal vintage carriages.', false, now(), now()),
    ('sa000000-0000-0000-0005-000000000004', t5_stop1, act_blr_brewery, 4, '19:00', 25.00, 'Craft beer tasting & wood-fired pizza trail in Indiranagar.', false, now(), now());

  -- ============================================================================
  -- 8. Insert Expenses
  -- ============================================================================

  INSERT INTO public.expenses (id, trip_id, stop_id, category, amount, currency, description, date, created_at, updated_at) VALUES
    -- Trip 1 Expenses
    ('ex000000-0000-0000-0001-000000000001', trip1_id, t1_stop1, 'Transport', 85.00, 'USD', 'Private AC Cab (Delhi to Jaipur Express Highway)', (CURRENT_DATE + INTERVAL '17 days')::DATE, now(), now()),
    ('ex000000-0000-0000-0001-000000000002', trip1_id, t1_stop2, 'Accommodation', 525.00, 'USD', 'Heritage Haveli Stay in Old Jaipur', (CURRENT_DATE + INTERVAL '17 days')::DATE, now(), now()),

    -- Trip 2 Expenses
    ('ex000000-0000-0000-0002-000000000001', trip2_id, t2_stop1, 'Transport', 45.00, 'USD', 'Scooter Rental (5 Days)', (CURRENT_DATE - INTERVAL '2 days')::DATE, now(), now()),
    ('ex000000-0000-0000-0002-000000000002', trip2_id, t2_stop1, 'Accommodation', 350.00, 'USD', 'Beachfront Villa at Candolim', (CURRENT_DATE - INTERVAL '2 days')::DATE, now(), now()),

    -- Trip 3 Expenses
    ('ex000000-0000-0000-0003-000000000001', trip3_id, t3_stop1, 'Transport', 45.00, 'USD', 'Vande Bharat Express (Ahmedabad to Mumbai)', (CURRENT_DATE - INTERVAL '26 days')::DATE, now(), now()),
    ('ex000000-0000-0000-0003-000000000002', trip3_id, t3_stop2, 'Accommodation', 320.00, 'USD', 'South Mumbai Art Deco Hotel', (CURRENT_DATE - INTERVAL '26 days')::DATE, now(), now()),

    -- Trip 4 Expenses
    ('ex000000-0000-0000-0004-000000000001', trip4_id, t4_stop1, 'Accommodation', 380.00, 'USD', 'Riverside Apple Orchard Pine Cottage', (CURRENT_DATE + INTERVAL '28 days')::DATE, now(), now()),
    ('ex000000-0000-0000-0004-000000000002', trip4_id, t4_stop1, 'Transport', 60.00, 'USD', 'Private SUV Airport Transfer (Bhuntar to Manali)', (CURRENT_DATE + INTERVAL '28 days')::DATE, now(), now()),

    -- Trip 5 Expenses
    ('ex000000-0000-0000-0005-000000000001', trip5_id, t5_stop1, 'Accommodation', 290.00, 'USD', 'Indiranagar Boutique Heritage Hotel', (CURRENT_DATE + INTERVAL '42 days')::DATE, now(), now()),
    ('ex000000-0000-0000-0005-000000000002', trip5_id, t5_stop1, 'Food & Dining', 50.00, 'USD', 'Chef''s Tasting Dinner at Indiranagar', (CURRENT_DATE + INTERVAL '43 days')::DATE, now(), now());

  RAISE NOTICE 'Demo dataset seeding completed successfully with 5 trips (including 3 upcoming trips, 1 ongoing, and 1 past)!';
END $$;
