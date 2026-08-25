-- ==============================================================================
-- STEP 27: SEED MOBILE CATALOG DATA
-- Execute this script in your Supabase Project -> SQL Editor
-- This script is completely IDEMPOTENT (safe to run multiple times without duplicates)
-- ==============================================================================

DO $$
DECLARE
  v_mobile_id UUID;
BEGIN

  -- ----------------------------------------------------------------------------
  -- 1. Apple iPhone 16
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Apple' AND name = 'iPhone 16';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Apple', 'iPhone 16', 79900, 89900, '8GB', '128GB',
      'A18 Bionic (3nm, 6-core CPU, 5-core GPU, 16-core Neural Engine)',
      '6.1" Super Retina XDR OLED, 2556x1179, 2000 nits peak brightness, Ceramic Shield',
      '48MP Fusion (f/1.6, Sensor-shift OIS) + 12MP Ultra Wide with Macro, 4K Dolby Vision 60fps',
      '3561 mAh, MagSafe wireless charging up to 25W, Qi2 wireless charging up to 15W',
      'Powered by the next-generation A18 chip with Apple Intelligence, the iPhone 16 introduces Camera Control, an advanced 48MP Fusion camera system with 2x optical-quality Telephoto, and a durable aerospace-grade aluminum chassis with color-infused back glass.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 79900, original_price = 89900, ram = '8GB', storage = '128GB',
      processor = 'A18 Bionic (3nm, 6-core CPU, 5-core GPU, 16-core Neural Engine)',
      display = '6.1" Super Retina XDR OLED, 2556x1179, 2000 nits peak brightness, Ceramic Shield',
      camera = '48MP Fusion (f/1.6, Sensor-shift OIS) + 12MP Ultra Wide with Macro, 4K Dolby Vision 60fps',
      battery = '3561 mAh, MagSafe wireless charging up to 25W, Qi2 wireless charging up to 15W',
      description = 'Powered by the next-generation A18 chip with Apple Intelligence, the iPhone 16 introduces Camera Control, an advanced 48MP Fusion camera system with 2x optical-quality Telephoto, and a durable aerospace-grade aluminum chassis with color-infused back glass.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', 'img_ip16_1', 'Apple iPhone 16 front and back studio shot', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', 'img_ip16_2', 'Apple iPhone 16 display perspective', 1);

  -- ----------------------------------------------------------------------------
  -- 2. Apple iPhone 16 Pro
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Apple' AND name = 'iPhone 16 Pro';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Apple', 'iPhone 16 Pro', 119900, 129900, '8GB', '256GB',
      'A18 Pro chip (6-core GPU with hardware ray tracing, 16-core Neural Engine)',
      '6.3" ProMotion Super Retina XDR OLED, 120Hz Always-On, 2000 nits, Dynamic Island',
      '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto with Tetraprism, 4K 120fps Dolby Vision',
      '3582 mAh with up to 27 hours video playback, 50% charge in 30 mins with 20W+ adapter',
      'Crafted from Grade 5 Titanium with thinner borders, the iPhone 16 Pro delivers studio-grade 4K 120 fps Dolby Vision recording, 5x optical zoom across all Pro sizes, and powerhouse sustained pro gaming performance driven by the A18 Pro silicon.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 119900, original_price = 129900, ram = '8GB', storage = '256GB',
      processor = 'A18 Pro chip (6-core GPU with hardware ray tracing, 16-core Neural Engine)',
      display = '6.3" ProMotion Super Retina XDR OLED, 120Hz Always-On, 2000 nits, Dynamic Island',
      camera = '48MP Fusion + 48MP Ultra Wide + 12MP 5x Telephoto with Tetraprism, 4K 120fps Dolby Vision',
      battery = '3582 mAh with up to 27 hours video playback, 50% charge in 30 mins with 20W+ adapter',
      description = 'Crafted from Grade 5 Titanium with thinner borders, the iPhone 16 Pro delivers studio-grade 4K 120 fps Dolby Vision recording, 5x optical zoom across all Pro sizes, and powerhouse sustained pro gaming performance driven by the A18 Pro silicon.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=80', 'img_ip16p_1', 'Apple iPhone 16 Pro Titanium showcase', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=80', 'img_ip16p_2', 'Apple iPhone 16 Pro camera module angle', 1);

  -- ----------------------------------------------------------------------------
  -- 3. Apple iPhone 16 Pro Max
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Apple' AND name = 'iPhone 16 Pro Max';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Apple', 'iPhone 16 Pro Max', 144900, 159900, '8GB', '256GB',
      'A18 Pro chip (Second-generation 3nm architecture, desktop-class memory bandwidth)',
      '6.9" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits peak, Dynamic Island',
      '48MP Fusion (f/1.78) + 48MP Ultra Wide + 12MP 5x Telephoto (120mm focal length), ProRes Log',
      '4685 mAh, industry-leading battery longevity with up to 33 hours continuous video playback',
      'The ultimate flagship smartphone featuring Apple''s largest 6.9-inch display, Grade 5 aerospace titanium architecture, enhanced 5x telephoto optical zoom, studio microphones, and unprecedented battery performance designed for demanding power creators.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 144900, original_price = 159900, ram = '8GB', storage = '256GB',
      processor = 'A18 Pro chip (Second-generation 3nm architecture, desktop-class memory bandwidth)',
      display = '6.9" Super Retina XDR OLED, 120Hz ProMotion, 2000 nits peak, Dynamic Island',
      camera = '48MP Fusion (f/1.78) + 48MP Ultra Wide + 12MP 5x Telephoto (120mm focal length), ProRes Log',
      battery = '4685 mAh, industry-leading battery longevity with up to 33 hours continuous video playback',
      description = 'The ultimate flagship smartphone featuring Apple''s largest 6.9-inch display, Grade 5 aerospace titanium architecture, enhanced 5x telephoto optical zoom, studio microphones, and unprecedented battery performance designed for demanding power creators.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80', 'img_ip16pm_1', 'Apple iPhone 16 Pro Max hero presentation', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=80', 'img_ip16pm_2', 'Apple iPhone 16 Pro Max design details', 1);

  -- ----------------------------------------------------------------------------
  -- 4. Samsung Galaxy S25
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Samsung' AND name = 'Galaxy S25';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Samsung', 'Galaxy S25', 74999, 82999, '12GB', '256GB',
      'Qualcomm Snapdragon 8 Elite (3nm, custom Oryon CPU cores)',
      '6.2" Dynamic AMOLED 2X, 120Hz Adaptive Refresh, 2600 nits peak brightness, HDR10+',
      '50MP Dual Pixel Wide (OIS) + 12MP Ultra-Wide + 10MP Telephoto (3x Optical Zoom, 30x Space Zoom)',
      '4000 mAh, 25W Fast Wired Charging, Fast Wireless Charging 2.0, Wireless PowerShare',
      'Sleek, compact, and packed with Galaxy AI multimodal intelligence. The Galaxy S25 combines Snapdragon 8 Elite computing, Armor Aluminum framing, and a brilliant 2600-nit Dynamic AMOLED screen for effortless productivity and photography.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 74999, original_price = 82999, ram = '12GB', storage = '256GB',
      processor = 'Qualcomm Snapdragon 8 Elite (3nm, custom Oryon CPU cores)',
      display = '6.2" Dynamic AMOLED 2X, 120Hz Adaptive Refresh, 2600 nits peak brightness, HDR10+',
      camera = '50MP Dual Pixel Wide (OIS) + 12MP Ultra-Wide + 10MP Telephoto (3x Optical Zoom, 30x Space Zoom)',
      battery = '4000 mAh, 25W Fast Wired Charging, Fast Wireless Charging 2.0, Wireless PowerShare',
      description = 'Sleek, compact, and packed with Galaxy AI multimodal intelligence. The Galaxy S25 combines Snapdragon 8 Elite computing, Armor Aluminum framing, and a brilliant 2600-nit Dynamic AMOLED screen for effortless productivity and photography.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80', 'img_s25_1', 'Samsung Galaxy S25 sleek profile', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1000&q=80', 'img_s25_2', 'Samsung Galaxy S25 camera array', 1);

  -- ----------------------------------------------------------------------------
  -- 5. Samsung Galaxy S25 Ultra
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Samsung' AND name = 'Galaxy S25 Ultra';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Samsung', 'Galaxy S25 Ultra', 129999, 139999, '12GB', '512GB',
      'Snapdragon 8 Elite for Galaxy (4.47GHz peak clock speed, Adreno 830 GPU)',
      '6.8" Dynamic AMOLED 2X QHD+, 1-120Hz LTPO, Corning Gorilla Armor anti-reflective glass',
      '200MP Main (ISOCELL HP2) + 50MP Ultra-Wide + 50MP 5x Periscope Telephoto + 10MP 3x Telephoto (100x Space Zoom)',
      '5000 mAh, 45W wired charging (65% in 30 mins), 15W wireless charging, embedded S-Pen',
      'Samsung''s premier titanium flagship featuring an integrated S Pen, anti-reflective Gorilla Armor optics, quad-telephoto 200MP imaging with 8K 60fps video, and a comprehensive suite of on-device Galaxy AI generative capabilities.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 129999, original_price = 139999, ram = '12GB', storage = '512GB',
      processor = 'Snapdragon 8 Elite for Galaxy (4.47GHz peak clock speed, Adreno 830 GPU)',
      display = '6.8" Dynamic AMOLED 2X QHD+, 1-120Hz LTPO, Corning Gorilla Armor anti-reflective glass',
      camera = '200MP Main (ISOCELL HP2) + 50MP Ultra-Wide + 50MP 5x Periscope Telephoto + 10MP 3x Telephoto (100x Space Zoom)',
      battery = '5000 mAh, 45W wired charging (65% in 30 mins), 15W wireless charging, embedded S-Pen',
      description = 'Samsung''s premier titanium flagship featuring an integrated S Pen, anti-reflective Gorilla Armor optics, quad-telephoto 200MP imaging with 8K 60fps video, and a comprehensive suite of on-device Galaxy AI generative capabilities.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1585060544812-6b45742d762f?auto=format&fit=crop&w=1000&q=80', 'img_s25u_1', 'Samsung Galaxy S25 Ultra Titanium exterior', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=1000&q=80', 'img_s25u_2', 'Samsung Galaxy S25 Ultra with stylus perspective', 1);

  -- ----------------------------------------------------------------------------
  -- 6. Google Pixel 9
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Google' AND name = 'Pixel 9';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Google', 'Pixel 9', 79999, 84999, '12GB', '128GB',
      'Google Tensor G4 with Titan M2 dedicated hardware security coprocessor',
      '6.3" Actua OLED display, 60-120Hz Smooth Display, 2700 nits peak brightness, Gorilla Glass Victus 2',
      '50MP Octa PD Wide (f/1.68) + 48MP Quad PD Ultra-Wide with Macro Focus, Night Sight Video',
      '4700 mAh, 24+ hour battery life, Extreme Battery Saver up to 100 hours, Fast wireless charging',
      'Designed by Google with an iconic sculpted camera bar and Gemini AI built into the hardware foundation. Experience industry-leading computational photography, Real Tone capture, Magic Editor, and guaranteed 7 years of OS & security upgrades.',
      'in_stock', true, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 79999, original_price = 84999, ram = '12GB', storage = '128GB',
      processor = 'Google Tensor G4 with Titan M2 dedicated hardware security coprocessor',
      display = '6.3" Actua OLED display, 60-120Hz Smooth Display, 2700 nits peak brightness, Gorilla Glass Victus 2',
      camera = '50MP Octa PD Wide (f/1.68) + 48MP Quad PD Ultra-Wide with Macro Focus, Night Sight Video',
      battery = '4700 mAh, 24+ hour battery life, Extreme Battery Saver up to 100 hours, Fast wireless charging',
      description = 'Designed by Google with an iconic sculpted camera bar and Gemini AI built into the hardware foundation. Experience industry-leading computational photography, Real Tone capture, Magic Editor, and guaranteed 7 years of OS & security upgrades.',
      stock_status = 'in_stock', is_featured = true, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80', 'img_px9_1', 'Google Pixel 9 camera bar and chassis', 0),
    (v_mobile_id, 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=1000&q=80', 'img_px9_2', 'Google Pixel 9 display view', 1);

  -- ----------------------------------------------------------------------------
  -- 7. OnePlus 13
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'OnePlus' AND name = 'OnePlus 13';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'OnePlus', 'OnePlus 13', 69999, 74999, '16GB', '512GB',
      'Snapdragon 8 Elite Mobile Platform (3nm, Dual Prime Cores at 4.32GHz)',
      '6.82" 2K 120Hz ProXDR Oriental AMOLED, 4500 nits peak, Dolby Vision, DisplayMate A++',
      '50MP Sony LYT-808 (OIS) + 50MP Ultra-Wide + 50MP 3x Periscope Telephoto (Hasselblad Color Calibration)',
      '6000 mAh Silicon-Carbon Glacier Battery, 100W SUPERVOOC wired, 50W AIRVOOC wireless',
      'Extreme performance powerhouse featuring 5th Gen Hasselblad color science, a massive 6000mAh silicon-carbon battery with 100W flash charging, and a crystal-clear 2K Oriental AMOLED display with IP68 & IP69 water resistance certifications.',
      'in_stock', false, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 69999, original_price = 74999, ram = '16GB', storage = '512GB',
      processor = 'Snapdragon 8 Elite Mobile Platform (3nm, Dual Prime Cores at 4.32GHz)',
      display = '6.82" 2K 120Hz ProXDR Oriental AMOLED, 4500 nits peak, Dolby Vision, DisplayMate A++',
      camera = '50MP Sony LYT-808 (OIS) + 50MP Ultra-Wide + 50MP 3x Periscope Telephoto (Hasselblad Color Calibration)',
      battery = '6000 mAh Silicon-Carbon Glacier Battery, 100W SUPERVOOC wired, 50W AIRVOOC wireless',
      description = 'Extreme performance powerhouse featuring 5th Gen Hasselblad color science, a massive 6000mAh silicon-carbon battery with 100W flash charging, and a crystal-clear 2K Oriental AMOLED display with IP68 & IP69 water resistance certifications.',
      stock_status = 'in_stock', is_featured = false, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80', 'img_op13_1', 'OnePlus 13 flagship handset', 0);

  -- ----------------------------------------------------------------------------
  -- 8. Xiaomi 15
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Xiaomi' AND name = 'Xiaomi 15';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Xiaomi', 'Xiaomi 15', 64999, 69999, '12GB', '256GB',
      'Snapdragon 8 Elite (3nm architecture, Xiaomi HyperCore scheduler)',
      '6.36" 1.5K OLED, 1-120Hz LTPO, 3200 nits peak brightness, 1.38mm ultra-thin symmetric bezels',
      'Leica Summilux Trio: 50MP Light Fusion 900 (OIS) + 50MP 75mm Floating Telephoto + 50MP 115° Ultra-Wide',
      '5400 mAh Jinshajiang High-Density Battery, 90W HyperCharge, 50W Wireless HyperCharge',
      'Co-engineered with Leica, the Xiaomi 15 delivers master portrait and street photography in a compact golden-ratio form factor with ultra-bright 3200-nit optics, Xiaomi HyperOS 2 fluid animations, and high-density battery longevity.',
      'in_stock', false, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 64999, original_price = 69999, ram = '12GB', storage = '256GB',
      processor = 'Snapdragon 8 Elite (3nm architecture, Xiaomi HyperCore scheduler)',
      display = '6.36" 1.5K OLED, 1-120Hz LTPO, 3200 nits peak brightness, 1.38mm ultra-thin symmetric bezels',
      camera = 'Leica Summilux Trio: 50MP Light Fusion 900 (OIS) + 50MP 75mm Floating Telephoto + 50MP 115° Ultra-Wide',
      battery = '5400 mAh Jinshajiang High-Density Battery, 90W HyperCharge, 50W Wireless HyperCharge',
      description = 'Co-engineered with Leica, the Xiaomi 15 delivers master portrait and street photography in a compact golden-ratio form factor with ultra-bright 3200-nit optics, Xiaomi HyperOS 2 fluid animations, and high-density battery longevity.',
      stock_status = 'in_stock', is_featured = false, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80', 'img_mi15_1', 'Xiaomi 15 Leica camera smartphone', 0);

  -- ----------------------------------------------------------------------------
  -- 9. Nothing Phone 3
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Nothing' AND name = 'Phone 3';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Nothing', 'Phone 3', 49999, 54999, '12GB', '256GB',
      'Qualcomm Snapdragon 8s Gen 3 Mobile Platform (4nm TSMC)',
      '6.7" Flexible LTPO AMOLED, 1-120Hz Adaptive, 2000 nits, HDR10+, 1.07 billion colors',
      '50MP Sony IMX890 (OIS) + 50MP Samsung JN1 Ultra-Wide (114° FOV) + 32MP High-Res Front Camera',
      '5000 mAh, 65W wired charging (100% in 35 mins), 15W wireless charging, 5W reverse wireless',
      'Featuring Nothing''s signature transparent industrial aesthetics with customizable Glyph Matrix LED lighting, clean bloatware-free Nothing OS 3.0, and studio dual 50MP sensors for striking visual personality and fluid day-to-day operation.',
      'limited_stock', false, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 49999, original_price = 54999, ram = '12GB', storage = '256GB',
      processor = 'Qualcomm Snapdragon 8s Gen 3 Mobile Platform (4nm TSMC)',
      display = '6.7" Flexible LTPO AMOLED, 1-120Hz Adaptive, 2000 nits, HDR10+, 1.07 billion colors',
      camera = '50MP Sony IMX890 (OIS) + 50MP Samsung JN1 Ultra-Wide (114° FOV) + 32MP High-Res Front Camera',
      battery = '5000 mAh, 65W wired charging (100% in 35 mins), 15W wireless charging, 5W reverse wireless',
      description = 'Featuring Nothing''s signature transparent industrial aesthetics with customizable Glyph Matrix LED lighting, clean bloatware-free Nothing OS 3.0, and studio dual 50MP sensors for striking visual personality and fluid day-to-day operation.',
      stock_status = 'limited_stock', is_featured = false, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=1000&q=80', 'img_np3_1', 'Nothing Phone 3 transparent glyph styling', 0);

  -- ----------------------------------------------------------------------------
  -- 10. Motorola Edge 60 Pro
  -- ----------------------------------------------------------------------------
  SELECT id INTO v_mobile_id FROM mobiles WHERE brand = 'Motorola' AND name = 'Edge 60 Pro';
  IF v_mobile_id IS NULL THEN
    INSERT INTO mobiles (
      brand, name, price, original_price, ram, storage,
      processor, display, camera, battery, description,
      stock_status, is_featured, is_hidden
    ) VALUES (
      'Motorola', 'Edge 60 Pro', 54999, 59999, '12GB', '256GB',
      'MediaTek Dimensity 9300+ (4nm All-Big-Core architecture, Immortalis GPU)',
      '6.7" Quad Curved Endless Edge pOLED, 144Hz Refresh, 2500 nits, Pantone Validated Colors',
      '50MP OIS Main + 50MP Ultra-Wide/Macro + 64MP 3x Optical Telephoto, 50MP Quad Pixel Front Camera',
      '5100 mAh, 125W TurboPower wired charging (100% in 18 mins), 50W wireless charging',
      'Elegantly crafted with curved quad-edge contours and premium vegan leather texture. Highlights a blazing-fast 144Hz Pantone-validated pOLED display, 125W rapid charging, and clean Moto Hello UI with Ready For desktop connectivity.',
      'in_stock', false, false
    ) RETURNING id INTO v_mobile_id;
  ELSE
    UPDATE mobiles SET
      price = 54999, original_price = 59999, ram = '12GB', storage = '256GB',
      processor = 'MediaTek Dimensity 9300+ (4nm All-Big-Core architecture, Immortalis GPU)',
      display = '6.7" Quad Curved Endless Edge pOLED, 144Hz Refresh, 2500 nits, Pantone Validated Colors',
      camera = '50MP OIS Main + 50MP Ultra-Wide/Macro + 64MP 3x Optical Telephoto, 50MP Quad Pixel Front Camera',
      battery = '5100 mAh, 125W TurboPower wired charging (100% in 18 mins), 50W wireless charging',
      description = 'Elegantly crafted with curved quad-edge contours and premium vegan leather texture. Highlights a blazing-fast 144Hz Pantone-validated pOLED display, 125W rapid charging, and clean Moto Hello UI with Ready For desktop connectivity.',
      stock_status = 'in_stock', is_featured = false, is_hidden = false
    WHERE id = v_mobile_id;
  END IF;

  DELETE FROM mobile_images WHERE mobile_id = v_mobile_id;
  INSERT INTO mobile_images (mobile_id, image_url, public_id, alt_text, display_order)
  VALUES
    (v_mobile_id, 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1000&q=80', 'img_edge60_1', 'Motorola Edge 60 Pro curved display', 0);

END $$;
