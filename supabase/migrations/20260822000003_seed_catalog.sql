-- ==============================================================================
-- GlobeTrotter AI - Travel Catalog Seed Data
-- Migration: 20260822000003_seed_catalog.sql
-- Description: Seed 10 representative destinations and 50 curated activities.
-- ==============================================================================

-- ==============================================================================
-- 1. Insert 10 Cities
-- ==============================================================================
INSERT INTO public.cities (id, name, country, region, cost_index, popularity_score, latitude, longitude, image_url, description)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001',
    'Ahmedabad',
    'India',
    'Gujarat',
    2.2,
    4.5,
    23.0225,
    72.5714,
    'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=800&auto=format&fit=crop&q=80',
    'India’s first UNESCO World Heritage City, famous for intricate stepwells, vibrant night food markets, textile heritage, and Gandhi Ashram.'
  ),
  (
    'c0000000-0000-0000-0000-000000000002',
    'Mumbai',
    'India',
    'Maharashtra',
    3.8,
    4.8,
    18.9220,
    72.8347,
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop&q=80',
    'The vibrant City of Dreams, featuring historic Victorian architecture, Marine Drive, Bollywood culture, and a world-class culinary scene.'
  ),
  (
    'c0000000-0000-0000-0000-000000000003',
    'Goa',
    'India',
    'Goa',
    2.8,
    4.9,
    15.2993,
    74.1240,
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    'Sun-kissed Arabian Sea coastline, Portuguese heritage villas, water sports, vibrant beach shacks, and tropical spice plantations.'
  ),
  (
    'c0000000-0000-0000-0000-000000000004',
    'Bangalore',
    'India',
    'Karnataka',
    3.0,
    4.4,
    12.9716,
    77.5946,
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=80',
    'India’s Garden City and tech capital, renowned for craft microbreweries, lush botanical parks, vibrant cafe culture, and pleasant year-round weather.'
  ),
  (
    'c0000000-0000-0000-0000-000000000005',
    'Delhi',
    'India',
    'National Capital Region',
    2.7,
    4.7,
    28.6139,
    77.2090,
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=80',
    'The historic heart of India, where majestic Mughal monuments meet modern boulevards, world-class museums, and legendary Old Delhi street food.'
  ),
  (
    'c0000000-0000-0000-0000-000000000006',
    'Jaipur',
    'India',
    'Rajasthan',
    2.5,
    4.8,
    26.9124,
    75.7873,
    'https://images.unsplash.com/photo-1603288940300-349f2b86ec32?w=800&auto=format&fit=crop&q=80',
    'The Pink City of Rajasthan, adorned with hilltop forts, royal palaces, gemstone bazaars, and opulent royal cuisine.'
  ),
  (
    'c0000000-0000-0000-0000-000000000007',
    'Manali',
    'India',
    'Himachal Pradesh',
    2.4,
    4.6,
    32.2432,
    77.1892,
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&auto=format&fit=crop&q=80',
    'Himalayan paradise surrounded by pine forests, snow peaks, Solang Valley adventure sports, and scenic mountain passes like Rohtang.'
  ),
  (
    'c0000000-0000-0000-0000-000000000008',
    'Dubai',
    'United Arab Emirates',
    'Middle East',
    4.6,
    4.9,
    25.2048,
    55.2708,
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&auto=format&fit=crop&q=80',
    'Futuristic metropolis boasting the world’s tallest skyscrapers, luxury desert safaris, mega shopping malls, and futuristic architecture.'
  ),
  (
    'c0000000-0000-0000-0000-000000000009',
    'Paris',
    'France',
    'Western Europe',
    4.5,
    5.0,
    48.8566,
    2.3522,
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80',
    'The City of Light, world capital of art, gastronomy, and fashion, graced by the Eiffel Tower, the Louvre, and romantic Seine cruises.'
  ),
  (
    'c0000000-0000-0000-0000-000000000010',
    'Bali',
    'Indonesia',
    'Southeast Asia',
    2.6,
    4.9,
    -8.4095,
    115.1889,
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&auto=format&fit=crop&q=80',
    'Island of the Gods featuring lush emerald rice terraces, sacred Hindu water temples, volcanic sunrises, world-class surfing, and serene wellness retreats.'
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  country = EXCLUDED.country,
  region = EXCLUDED.region,
  cost_index = EXCLUDED.cost_index,
  popularity_score = EXCLUDED.popularity_score,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  image_url = EXCLUDED.image_url,
  description = EXCLUDED.description;

-- ==============================================================================
-- 2. Insert Activities (5 per city = 50 curated activities)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- City 1: Ahmedabad
-- ------------------------------------------------------------------------------
INSERT INTO public.activities (id, city_id, title, description, category, estimated_cost, duration_hours, image_url)
VALUES
  (
    'a0000000-0000-0000-0001-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Sabarmati Gandhi Ashram Heritage Walk',
    'Explore Mahatma Gandhi’s historic headquarters on the banks of Sabarmati River and learn about the Dandi Salt March.',
    'Culture & History',
    0.00,
    2.5,
    'https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0001-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'Adalaj Stepwell Architecture Tour',
    'Marvel at the 15th-century five-story deep subterranean stepwell featuring intricate Solanki style stone carvings.',
    'Sightseeing',
    1.00,
    2.0,
    'https://images.unsplash.com/photo-1627916607164-7b20241db935?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0001-000000000003',
    'c0000000-0000-0000-0000-000000000001',
    'Manek Chowk Midnight Street Food Safari',
    'Experience the bustling night square transformed into a culinary feast featuring chocolate sandwiches, pav bhaji, and kulfi.',
    'Food & Dining',
    10.00,
    2.0,
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0001-000000000004',
    'c0000000-0000-0000-0000-000000000001',
    'Calico Museum of Textiles Guided Walk',
    'Admire one of the world’s finest collections of historic Indian handcrafted textiles, court costumes, and Mughal tapestries.',
    'Culture & History',
    5.00,
    3.0,
    'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0001-000000000005',
    'c0000000-0000-0000-0000-000000000001',
    'Sabarmati Riverfront Sunset Cycling',
    'Rent an eco-cycle and pedal along the beautifully landscaped river promenade during sunset.',
    'Adventure',
    3.00,
    1.5,
    'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 2: Mumbai
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0002-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'Gateway of India & Elephanta Island Caves Ferry',
    'Board a scenic harbour ferry from the historic Gateway of India to ancient rock-cut cave temples dedicated to Lord Shiva.',
    'Culture & History',
    15.00,
    4.5,
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0002-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Marine Drive Queen’s Necklace Evening Walk',
    'Stroll along the 3-kilometer coastal boulevard and watch Arabian Sea waves crash against tetrapods at golden hour.',
    'Sightseeing',
    0.00,
    2.0,
    'https://images.unsplash.com/photo-1566552881560-0be86c53e14b?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0002-000000000003',
    'c0000000-0000-0000-0000-000000000002',
    'South Mumbai Irani Cafe & Street Food Trail',
    'Savour bun maska, berry pulao, chai, vada pav, and coastal seafood across iconic colonial eateries.',
    'Food & Dining',
    18.00,
    3.0,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0002-000000000004',
    'c0000000-0000-0000-0000-000000000002',
    'Sanjay Gandhi National Park & Kanheri Caves Trek',
    'Hike through lush green wilderness right within the metropolis to discover ancient Buddhist monasteries carved into basalt hills.',
    'Nature',
    8.00,
    4.0,
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0002-000000000005',
    'c0000000-0000-0000-0000-000000000002',
    'Bandra Heritage & Bollywood Star Homes Walk',
    'Discover Portuguese churches, vibrant street art along Chapel Road, and seaside celebrity mansions in Bandra.',
    'Sightseeing',
    12.00,
    2.5,
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 3: Goa
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0003-000000000001',
    'c0000000-0000-0000-0000-000000000003',
    'Old Goa UNESCO Churches & Basilica Tour',
    'Visit the 16th-century Basilica of Bom Jesus and Se Cathedral, holding sacred relics of St. Francis Xavier.',
    'Culture & History',
    2.00,
    2.5,
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0003-000000000002',
    'c0000000-0000-0000-0000-000000000003',
    'Dudhsagar Waterfalls Jungle Jeep Safari',
    'A thrilling 4x4 jungle drive through Bhagwan Mahavir Wildlife Sanctuary to India’s four-tiered cascading sea of milk.',
    'Adventure',
    35.00,
    6.0,
    'https://images.unsplash.com/photo-1582650625119-3a31f8418b7d?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0003-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'Fontainhas Latin Quarter Walking & Photography Tour',
    'Wander through Panaji’s colourful heritage quarter filled with pastel yellow Portuguese houses and cozy cafes.',
    'Sightseeing',
    8.00,
    2.0,
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0003-000000000004',
    'c0000000-0000-0000-0000-000000000003',
    'Palolem Beach Kayaking & Sunset Dolphin Spotting',
    'Paddle along calm crescent bays, navigate sea caves, and spot playful dolphins in South Goa.',
    'Adventure',
    20.00,
    3.0,
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0003-000000000005',
    'c0000000-0000-0000-0000-000000000003',
    'Organic Spice Plantation Tour & Goan Buffet Lunch',
    'Learn about cardamom, vanilla, and cinnamon cultivation followed by an authentic Goan fish curry buffet served on banana leaves.',
    'Food & Dining',
    15.00,
    3.5,
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 4: Bangalore
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0004-000000000001',
    'c0000000-0000-0000-0000-000000000004',
    'Lalbagh Botanical Gardens & Glass House Morning Walk',
    'Admire century-old trees, tropical flora, and the iconic Victorian Glass House commissioned by Hyder Ali and Tipu Sultan.',
    'Nature',
    2.00,
    2.5,
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0004-000000000002',
    'c0000000-0000-0000-0000-000000000004',
    'Indiranagar & Koramangala Microbrewery Crawl',
    'Sample signature mango ales, Belgian wits, and IPAs at the country’s best craft taprooms.',
    'Food & Dining',
    25.00,
    3.5,
    'https://images.unsplash.com/photo-1538488881523-298921833f67?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0004-000000000003',
    'c0000000-0000-0000-0000-000000000004',
    'Bangalore Palace Tudor Architectural Tour',
    'Tour the royal wooden carvings, stained glass windows, and turreted towers inspired by England’s Windsor Castle.',
    'Sightseeing',
    6.00,
    2.0,
    'https://images.unsplash.com/photo-1580837119756-563d608dd119?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0004-000000000004',
    'c0000000-0000-0000-0000-000000000004',
    'Bannerghatta Biological Park Wildlife Safari',
    'Encounter royal Bengal tigers, lions, and Asian elephants in wide natural enclosures, along with a butterfly conservatory.',
    'Nature',
    12.00,
    4.0,
    'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0004-000000000005',
    'c0000000-0000-0000-0000-000000000004',
    'Traditional South Indian Tiffin Breakfast Tour in Malleshwaram',
    'Crispy benne dosas, steaming button idlis, and frothy filter coffee at vintage eateries like CTR and Veena Stores.',
    'Food & Dining',
    6.00,
    2.0,
    'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 5: Delhi
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0005-000000000001',
    'c0000000-0000-0000-0000-000000000005',
    'Old Delhi Rickshaw Safari & Chandni Chowk Spice Market',
    'Navigate vibrant ancient alleyways, Asia’s largest spice market at Khari Baoli, and taste legendary jalebis.',
    'Culture & History',
    14.00,
    3.0,
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0005-000000000002',
    'c0000000-0000-0000-0000-000000000005',
    'Humayun’s Tomb Mughal Architecture Tour',
    'Witness the breathtaking precursor to the Taj Mahal, set within magnificent Persian charbagh water gardens.',
    'Sightseeing',
    8.00,
    2.5,
    'https://images.unsplash.com/photo-1592635196078-9fdc757f27f4?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0005-000000000003',
    'c0000000-0000-0000-0000-000000000005',
    'Qutub Minar & Mehrauli Archaeological Park Walk',
    'Marvel at the 73-meter victory tower, 4th-century rust-resistant iron pillar, and ancient stepwells.',
    'Culture & History',
    8.00,
    3.0,
    'https://images.unsplash.com/photo-1548013146-72479768bada?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0005-000000000004',
    'c0000000-0000-0000-0000-000000000005',
    'Sunder Nursery Garden Stroll & Artisan Bazaar',
    'A tranquil 90-acre heritage park complex housing restored 16th-century monuments, lakes, and organic weekend farmers markets.',
    'Nature',
    3.00,
    2.5,
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0005-000000000005',
    'c0000000-0000-0000-0000-000000000005',
    'Hauz Khas Village Sunset & Lake View Dining',
    'Combine medieval Islamic seminaries and reservoir views with upscale rooftop dining and boutique shopping.',
    'Food & Dining',
    22.00,
    3.0,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 6: Jaipur
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0006-000000000001',
    'c0000000-0000-0000-0000-000000000006',
    'Amer Fort & Sheesh Mahal Guided Expedition',
    'Ascend the hilltop fortress to admire the dazzling Palace of Mirrors and panoramic views over Maota Lake.',
    'Culture & History',
    10.00,
    3.5,
    'https://images.unsplash.com/photo-1603288940300-349f2b86ec32?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0006-000000000002',
    'c0000000-0000-0000-0000-000000000006',
    'Hawa Mahal & City Palace Royal Photography Tour',
    'Photograph the iconic honeycomb façade with 953 jharokha windows and explore the active royal residence.',
    'Sightseeing',
    12.00,
    3.0,
    'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0006-000000000003',
    'c0000000-0000-0000-0000-000000000006',
    'Hot Air Balloon Flight Over Pink City Forts',
    'Float above ancient Rajput palaces, Aravali ridges, and desert villages at daybreak.',
    'Adventure',
    160.00,
    2.0,
    'https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0006-000000000004',
    'c0000000-0000-0000-0000-000000000006',
    'Traditional Rajasthani Thali Dining at Chokhi Dhani',
    'An ethnic village fair with folk dancers, puppet shows, camel rides, and endless ghee-soaked dal baati churma.',
    'Food & Dining',
    20.00,
    4.0,
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0006-000000000005',
    'c0000000-0000-0000-0000-000000000006',
    'Johari Bazaar Gemstone & Block Print Shopping',
    'Bargain for handmade silver jewelry, authentic Bagru block-printed quilts, and blue pottery.',
    'Sightseeing',
    5.00,
    2.5,
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 7: Manali
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0007-000000000001',
    'c0000000-0000-0000-0000-000000000007',
    'Solang Valley Paragliding & Zorbing Adventure',
    'Soar high above snow-capped Himalayan peaks and alpine meadows with certified tandem pilots.',
    'Adventure',
    40.00,
    3.0,
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0007-000000000002',
    'c0000000-0000-0000-0000-000000000007',
    'Rohtang Pass & Atal Tunnel High Altitude Excursion',
    'Journey to 3,978 meters elevation for year-round snow landscapes, glacial streams, and Pir Panjal vistas.',
    'Sightseeing',
    30.00,
    6.0,
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0007-000000000003',
    'c0000000-0000-0000-0000-000000000007',
    'Old Manali Cafe Culture & Live Acoustic Evenings',
    'Unwind in rustic wooden apple-orchard cafes with wood-fired pizzas, trout delicacies, and indie mountain musicians.',
    'Food & Dining',
    15.00,
    3.0,
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0007-000000000004',
    'c0000000-0000-0000-0000-000000000007',
    'Hadimba Wooden Temple & Cedar Forest Walk',
    'Visit the 1553 pagoda-style wooden temple dedicated to Hadimba Devi nestled among towering deodar forests.',
    'Culture & History',
    1.00,
    2.0,
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0007-000000000005',
    'c0000000-0000-0000-0000-000000000007',
    'Jogini Waterfall Forest Hike & Picnic',
    'Trek past small streams and pine woods from Vashisht village to a thunderous two-tier waterfall.',
    'Nature',
    0.00,
    3.5,
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 8: Dubai
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0008-000000000001',
    'c0000000-0000-0000-0000-000000000008',
    'Burj Khalifa At The Top Observation Deck',
    'Take the world’s fastest double-decker elevators up to levels 124 & 125 for 360-degree panoramas of Dubai and the Arabian Gulf.',
    'Sightseeing',
    48.00,
    2.0,
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0008-000000000002',
    'c0000000-0000-0000-0000-000000000008',
    'Red Dunes Desert Safari with BBQ Dinner & Stargazing',
    'Thrilling 4x4 dune bashing, sandboarding, camel rides, tanoura dance shows, and an Arabian feast under the stars.',
    'Adventure',
    65.00,
    6.0,
    'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0008-000000000003',
    'c0000000-0000-0000-0000-000000000008',
    'Dubai Marina Luxury Yacht Cruise',
    'Sail past Ain Dubai, JBR Beach, and Atlantis The Palm while enjoying gourmet dining on the water.',
    'Entertainment',
    75.00,
    2.5,
    'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0008-000000000004',
    'c0000000-0000-0000-0000-000000000008',
    'Museum of the Future Interactive Experience',
    'Journey into the year 2071 inside an architectural marvel shaped like a torus and decorated with Arabic calligraphy.',
    'Culture & History',
    42.00,
    2.5,
    'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0008-000000000005',
    'c0000000-0000-0000-0000-000000000008',
    'Al Fahidi Historical District & Gold Souk Abra Ride',
    'Cross Dubai Creek on a traditional 1 AED wooden abra to browse glittering gold souks and fragrant spice alleys.',
    'Sightseeing',
    10.00,
    3.0,
    'https://images.unsplash.com/photo-1546412414-e1885259563a?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 9: Paris
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0009-000000000001',
    'c0000000-0000-0000-0000-000000000009',
    'Eiffel Tower Summit Access & Champagne Toast',
    'Climb to the highest accessible observation deck in Europe for unmatched views across Paris.',
    'Sightseeing',
    38.00,
    2.5,
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0009-000000000002',
    'c0000000-0000-0000-0000-000000000009',
    'Louvre Museum Masterpieces Skip-the-Line Tour',
    'Discover the Mona Lisa, Venus de Milo, and Winged Victory of Samothrace in the world’s largest art museum.',
    'Culture & History',
    25.00,
    3.5,
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0009-000000000003',
    'c0000000-0000-0000-0000-000000000009',
    'Seine River Bateaux Parisiens Sunset Cruise',
    'Glide past Notre-Dame, Musée d’Orsay, and illuminated historical bridges as twilight covers Paris.',
    'Sightseeing',
    18.00,
    1.5,
    'https://images.unsplash.com/photo-1520939817895-060bdef4ad1b?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0009-000000000004',
    'c0000000-0000-0000-0000-000000000009',
    'Montmartre Artist Quarter & Sacré-Cœur Walking Tour',
    'Stroll cobblestone lanes where Picasso and Van Gogh painted, ending at the white domes of Sacré-Cœur basilica.',
    'Culture & History',
    12.00,
    2.5,
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0009-000000000005',
    'c0000000-0000-0000-0000-000000000009',
    'French Pastry & Macaron Masterclass in Le Marais',
    'Learn the delicate art of crafting chocolate croissants and colorful macarons with a master Parisian pastry chef.',
    'Food & Dining',
    60.00,
    3.0,
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80'
  ),

-- ------------------------------------------------------------------------------
-- City 10: Bali
-- ------------------------------------------------------------------------------
  (
    'a0000000-0000-0000-0010-000000000001',
    'c0000000-0000-0000-0000-000000000010',
    'Mount Batur Sunrise Trek & Volcanic Hot Springs',
    'Hike up the active volcanic crater in the pre-dawn darkness to watch clouds turn golden, followed by natural thermal baths.',
    'Adventure',
    45.00,
    6.0,
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0010-000000000002',
    'c0000000-0000-0000-0000-000000000010',
    'Tegalalang Rice Terraces & Jungle Swing in Ubud',
    'Walk through emerald tiered rice paddies and swing over jungle ravines with breathtaking tropical valley views.',
    'Nature',
    15.00,
    3.0,
    'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0010-000000000003',
    'c0000000-0000-0000-0000-000000000010',
    'Uluwatu Cliff Temple & Sunset Kecak Fire Dance',
    'Perched 70 meters above crashing surf, witness a mesmerizing traditional choir and fire performance at sunset.',
    'Culture & History',
    20.00,
    3.5,
    'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0010-000000000004',
    'c0000000-0000-0000-0000-000000000010',
    'Nusa Penida Island Snorkel Safari & Kelingking T-Rex Beach',
    'Speedboat to Nusa Penida to snorkel with majestic manta rays and photograph the world-famous T-Rex shaped coastal cliff.',
    'Adventure',
    60.00,
    8.0,
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&auto=format&fit=crop&q=80'
  ),
  (
    'a0000000-0000-0000-0010-000000000005',
    'c0000000-0000-0000-0000-000000000010',
    'Traditional Balinese Flower Bath & Herbal Spa Ritual',
    'A deeply rejuvenating wellness experience featuring warm coconut oil massages and a vibrant flower petal bath.',
    'Wellness',
    35.00,
    2.5,
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80'
  )
ON CONFLICT (id) DO UPDATE
SET
  city_id = EXCLUDED.city_id,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  estimated_cost = EXCLUDED.estimated_cost,
  duration_hours = EXCLUDED.duration_hours,
  image_url = EXCLUDED.image_url;
