-- ==============================================================================
-- MOBILÉ eCommerce — Reliable Idempotent Demo Reviews Seed Script (Step 32)
--
-- This script inserts 6 clearly marked Demo/Development reviews linked to real
-- smartphone products in the public.mobiles table.
-- Idempotent: Checks if review by customer_name already exists before inserting.
-- Run this in the Supabase SQL Editor.
-- ==============================================================================

DO $$
DECLARE
  v_iphone16pro_id UUID;
  v_s25ultra_id UUID;
  v_pixel9_id UUID;
  v_oneplus13_id UUID;
  v_iphone16_id UUID;
  v_nothing3_id UUID;
BEGIN
  -- 1. Resolve product IDs (Direct UUID match first, fallback to brand/name lookup)
  SELECT id INTO v_iphone16pro_id FROM public.mobiles WHERE id = '9c3020e1-03ef-4452-9a06-708a3eb97562' OR (brand = 'Apple' AND name ILIKE '%iPhone 16 Pro%') LIMIT 1;
  SELECT id INTO v_s25ultra_id FROM public.mobiles WHERE id = '7b8f945c-c8a5-49e6-977b-64e380efb5bd' OR (brand = 'Samsung' AND name ILIKE '%S25 Ultra%') LIMIT 1;
  SELECT id INTO v_pixel9_id FROM public.mobiles WHERE id = '63647391-0bef-4a1c-8d59-8da203ddcf82' OR (brand = 'Google' AND name ILIKE '%Pixel 9%') LIMIT 1;
  SELECT id INTO v_oneplus13_id FROM public.mobiles WHERE id = '9c1f3d18-54a1-4574-b844-b051d937395b' OR (brand = 'OnePlus' AND name ILIKE '%OnePlus 13%') LIMIT 1;
  SELECT id INTO v_iphone16_id FROM public.mobiles WHERE id = '20bdbbf0-7f02-4f00-ac4c-4084accb5ec3' OR (brand = 'Apple' AND name = 'iPhone 16') LIMIT 1;
  SELECT id INTO v_nothing3_id FROM public.mobiles WHERE id = '914b58ae-e619-4674-9a57-cbb9fb6d86dd' OR (brand = 'Nothing' AND name ILIKE '%Phone%3%') LIMIT 1;

  -- 2. Demo Customer 01 (Apple iPhone 16 Pro)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 01') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 01',
      'Verified Buyer',
      5,
      'Stellar performance and camera quality',
      'The titanium build feels remarkably light and the 5x telephoto camera delivers crisp concert photos. Battery easily lasts through a full day of heavy usage.',
      v_iphone16pro_id,
      NULL,
      false,
      timezone('utc'::text, now() - INTERVAL '5 days')
    );
  END IF;

  -- 3. Demo Customer 02 (Samsung Galaxy S25 Ultra)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 02') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 02',
      'Verified Buyer',
      5,
      'Incredible anti-reflective display',
      'The flat display with anti-reflective glass makes outdoor reading seamless. S-Pen integration and multitasking capabilities are unmatched for productivity.',
      v_s25ultra_id,
      NULL,
      false,
      timezone('utc'::text, now() - INTERVAL '4 days')
    );
  END IF;

  -- 4. Demo Customer 03 (Google Pixel 9)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 03') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 03',
      'Verified Buyer',
      5,
      'Best point-and-shoot camera on a phone',
      'Clean stock Android experience with rapid updates. Night Sight photography and on-device Magic Editor AI tools produce magazine-quality pictures.',
      v_pixel9_id,
      NULL,
      false,
      timezone('utc'::text, now() - INTERVAL '3 days')
    );
  END IF;

  -- 5. Demo Customer 04 (OnePlus 13)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 04') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 04',
      'Verified Buyer',
      5,
      'Lightning fast charging and smooth display',
      'Recharges from 10% to 100% in under 30 minutes. The 120Hz display with OxygenOS feels buttery smooth and gaming performance is outstanding.',
      v_oneplus13_id,
      NULL,
      false,
      timezone('utc'::text, now() - INTERVAL '2 days')
    );
  END IF;

  -- 6. Demo Customer 05 (Apple iPhone 16)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 05') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 05',
      'Verified Buyer',
      5,
      'Great daily driver with Camera Control',
      'The dedicated Camera Control button makes capturing quick family moments intuitive. Battery endurance is great and the color-infused glass looks gorgeous.',
      v_iphone16_id,
      NULL,
      false,
      timezone('utc'::text, now() - INTERVAL '1 days')
    );
  END IF;

  -- 7. Demo Customer 06 (Nothing Phone 3)
  IF NOT EXISTS (SELECT 1 FROM public.reviews WHERE customer_name = 'Demo Customer 06') THEN
    INSERT INTO public.reviews (
      customer_name,
      customer_role,
      rating,
      title,
      review_text,
      mobile_id,
      customer_id,
      is_hidden,
      created_at
    ) VALUES (
      'Demo Customer 06',
      'Verified Buyer',
      4,
      'Unique design and refreshing software',
      'Nothing OS is fluid and bloatware-free. The Glyph interface notifications are both functional and visually captivating. Very solid battery life.',
      v_nothing3_id,
      NULL,
      false,
      timezone('utc'::text, now())
    );
  END IF;

END $$;
