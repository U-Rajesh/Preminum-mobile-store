-- ==========================================
-- Premium Mobile Store - Supabase Database Schema
-- ==========================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. MOBILES TABLE (Step 5A)
-- ==========================================
CREATE TABLE IF NOT EXISTS mobiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  ram TEXT NOT NULL,
  storage TEXT NOT NULL,
  processor TEXT,
  display TEXT,
  camera TEXT,
  battery TEXT,
  description TEXT,
  stock_status TEXT NOT NULL DEFAULT 'in_stock',
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Database-level Constraints & Validations
  CONSTRAINT chk_mobiles_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT chk_mobiles_brand_not_empty CHECK (char_length(trim(brand)) > 0),
  CONSTRAINT chk_mobiles_price_non_negative CHECK (price >= 0),
  CONSTRAINT chk_mobiles_original_price_non_negative CHECK (original_price IS NULL OR original_price >= 0),
  CONSTRAINT chk_mobiles_stock_status_valid CHECK (stock_status IN ('in_stock', 'limited_stock', 'out_of_stock'))
);

-- Trigger function to automatically update updated_at timestamp on mobiles
CREATE OR REPLACE FUNCTION update_mobiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute before any update on mobiles table
DROP TRIGGER IF EXISTS trg_mobiles_updated_at ON mobiles;
CREATE TRIGGER trg_mobiles_updated_at
  BEFORE UPDATE ON mobiles
  FOR EACH ROW
  EXECUTE FUNCTION update_mobiles_updated_at();

-- Enable Row Level Security (RLS) on mobiles
ALTER TABLE mobiles ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 2. MOBILE IMAGES TABLE (Step 5B)
-- ==========================================
CREATE TABLE IF NOT EXISTS mobile_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_id UUID NOT NULL REFERENCES mobiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  alt_text TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints
  CONSTRAINT chk_mobile_images_url_not_empty CHECK (char_length(trim(image_url)) > 0),
  CONSTRAINT chk_mobile_images_public_id_not_empty CHECK (char_length(trim(public_id)) > 0),
  CONSTRAINT chk_mobile_images_display_order_range CHECK (display_order >= 0 AND display_order <= 4),
  CONSTRAINT uq_mobile_images_mobile_display_order UNIQUE (mobile_id, display_order)
);

-- Indexes for mobile_images
CREATE INDEX IF NOT EXISTS idx_mobile_images_mobile_id ON mobile_images(mobile_id);
CREATE INDEX IF NOT EXISTS idx_mobile_images_mobile_order ON mobile_images(mobile_id, display_order);

-- Trigger to enforce maximum 5 images per mobile
CREATE OR REPLACE FUNCTION check_mobile_images_count()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM mobile_images
  WHERE mobile_id = NEW.mobile_id;

  IF current_count >= 5 THEN
    RAISE EXCEPTION 'A mobile cannot have more than 5 images (mobile_id: %)', NEW.mobile_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_mobile_images_count ON mobile_images;
CREATE TRIGGER trg_check_mobile_images_count
  BEFORE INSERT ON mobile_images
  FOR EACH ROW
  EXECUTE FUNCTION check_mobile_images_count();

-- Enable Row Level Security (RLS) on mobile_images
ALTER TABLE mobile_images ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 3. REVIEWS TABLE (Step 5C & Step 31: Customer Reviews)
-- ==========================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mobile_id UUID REFERENCES mobiles(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_role TEXT,
  rating INTEGER NOT NULL,
  title TEXT,
  review_text TEXT NOT NULL,
  customer_avatar TEXT,
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints & Validations
  CONSTRAINT chk_reviews_customer_name_not_empty CHECK (char_length(trim(customer_name)) > 0),
  CONSTRAINT chk_reviews_review_text_not_empty CHECK (char_length(trim(review_text)) > 0),
  CONSTRAINT chk_reviews_rating_range CHECK (rating >= 1 AND rating <= 5),
  CONSTRAINT chk_reviews_customer_avatar_not_empty CHECK (customer_avatar IS NULL OR char_length(trim(customer_avatar)) > 0)
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_reviews_is_hidden ON reviews(is_hidden);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_mobile_id ON reviews(mobile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON reviews(customer_id);

-- Trigger function to automatically update updated_at timestamp on reviews
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute before any update on reviews table
DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Enable Row Level Security (RLS) on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 4. CONTACT INQUIRIES TABLE (Step 20)
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints & Validations
  CONSTRAINT chk_contact_inquiries_name_not_empty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT chk_contact_inquiries_email_not_empty CHECK (char_length(trim(email)) > 0),
  CONSTRAINT chk_contact_inquiries_subject_not_empty CHECK (char_length(trim(subject)) > 0),
  CONSTRAINT chk_contact_inquiries_message_not_empty CHECK (char_length(trim(message)) > 0),
  CONSTRAINT chk_contact_inquiries_status_valid CHECK (status IN ('new', 'read', 'resolved'))
);

-- Indexes for contact_inquiries
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);

-- Trigger function to automatically update updated_at timestamp on contact_inquiries
CREATE OR REPLACE FUNCTION update_contact_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contact_inquiries_updated_at ON contact_inquiries;
CREATE TRIGGER trg_contact_inquiries_updated_at
  BEFORE UPDATE ON contact_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_inquiries_updated_at();

-- Enable Row Level Security (RLS) on contact_inquiries
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 5. ORDERS TABLE (Step 22 & Step 25: Razorpay Integration)
-- ==========================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  subtotal NUMERIC NOT NULL,
  shipping_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT UNIQUE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_signature TEXT,
  payment_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints & Validations
  CONSTRAINT chk_orders_order_number_not_empty CHECK (char_length(trim(order_number)) > 0),
  CONSTRAINT chk_orders_name_not_empty CHECK (char_length(trim(customer_name)) > 0),
  CONSTRAINT chk_orders_email_not_empty CHECK (char_length(trim(customer_email)) > 0),
  CONSTRAINT chk_orders_phone_not_empty CHECK (char_length(trim(customer_phone)) > 0),
  CONSTRAINT chk_orders_address_not_empty CHECK (char_length(trim(address_line1)) > 0),
  CONSTRAINT chk_orders_city_not_empty CHECK (char_length(trim(city)) > 0),
  CONSTRAINT chk_orders_state_not_empty CHECK (char_length(trim(state)) > 0),
  CONSTRAINT chk_orders_pincode_not_empty CHECK (char_length(trim(pincode)) > 0),
  CONSTRAINT chk_orders_subtotal_non_negative CHECK (subtotal >= 0),
  CONSTRAINT chk_orders_shipping_non_negative CHECK (shipping_amount >= 0),
  CONSTRAINT chk_orders_total_non_negative CHECK (total_amount >= 0),
  CONSTRAINT chk_orders_status_valid CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  CONSTRAINT chk_orders_payment_status_valid CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'))
);

-- Indexes for orders
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);

-- Trigger function to automatically update updated_at timestamp on orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_orders_updated_at();

-- Enable Row Level Security (RLS) on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 6. ORDER ITEMS TABLE (Step 22)
-- ==========================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES mobiles(id) ON DELETE RESTRICT,
  product_name TEXT NOT NULL,
  brand TEXT,
  image_url TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints & Validations
  CONSTRAINT chk_order_items_product_name_not_empty CHECK (char_length(trim(product_name)) > 0),
  CONSTRAINT chk_order_items_quantity_positive CHECK (quantity > 0),
  CONSTRAINT chk_order_items_unit_price_non_negative CHECK (unit_price >= 0),
  CONSTRAINT chk_order_items_total_price_non_negative CHECK (total_price >= 0)
);

-- Indexes for order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Enable Row Level Security (RLS) on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 7. ADMIN USERS TABLE (Step 24)
-- ==========================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable Row Level Security (RLS) on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 8. CUSTOMER PROFILES TABLE (Step 31)
-- ==========================================
CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT chk_customer_profiles_name_not_empty CHECK (char_length(trim(full_name)) > 0)
);

-- Index for customer_profiles
CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_at ON customer_profiles(created_at DESC);

-- Enable Row Level Security on customer_profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 9. PAYMENT WEBHOOK EVENTS TABLE (Step 25)
-- ==========================================
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for webhook events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON payment_webhook_events(event_id);

-- Enable Row Level Security on payment_webhook_events
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;


-- ==========================================
-- 10. POLICIES (Step 7, 20, 22, 24, 25 & 31)
-- ==========================================

-- Policy 1: Allow public/anonymous users to SELECT only visible mobiles (is_hidden = false)
DROP POLICY IF EXISTS mobiles_public_select_visible ON mobiles;
CREATE POLICY mobiles_public_select_visible
  ON mobiles
  FOR SELECT
  TO public
  USING (is_hidden = false);

-- Policy 2: Allow public/anonymous users to SELECT images only for visible mobiles
DROP POLICY IF EXISTS mobile_images_public_select_visible_mobile ON mobile_images;
CREATE POLICY mobile_images_public_select_visible_mobile
  ON mobile_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM mobiles
      WHERE mobiles.id = mobile_images.mobile_id
        AND mobiles.is_hidden = false
    )
  );

-- Policy 3: Allow public/anonymous users to SELECT only visible reviews (is_hidden = false)
DROP POLICY IF EXISTS reviews_public_select_visible ON reviews;
CREATE POLICY reviews_public_select_visible
  ON reviews
  FOR SELECT
  TO public
  USING (is_hidden = false);

-- Policy 4: Allow public/anonymous users to INSERT contact inquiries (Step 20)
DROP POLICY IF EXISTS contact_inquiries_public_insert ON contact_inquiries;
CREATE POLICY contact_inquiries_public_insert
  ON contact_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 5: Allow public/anonymous users to INSERT orders (Step 22)
DROP POLICY IF EXISTS orders_public_insert ON orders;
CREATE POLICY orders_public_insert
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 6: Allow public/anonymous users to INSERT order items (Step 22)
DROP POLICY IF EXISTS order_items_public_insert ON order_items;
CREATE POLICY order_items_public_insert
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 7: Allow authenticated admin users to SELECT their own admin record (Step 24)
DROP POLICY IF EXISTS admin_users_select_self ON admin_users;
CREATE POLICY admin_users_select_self
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 8: Allow authenticated admin users full CRUD access to mobiles
DROP POLICY IF EXISTS mobiles_admin_all ON mobiles;
CREATE POLICY mobiles_admin_all
  ON mobiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  );

-- Policy 9: Allow authenticated admin users full CRUD access to mobile_images
DROP POLICY IF EXISTS mobile_images_admin_all ON mobile_images;
CREATE POLICY mobile_images_admin_all
  ON mobile_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  );

-- Policy 10: Allow authenticated admin users full access to orders
DROP POLICY IF EXISTS orders_admin_all ON orders;
CREATE POLICY orders_admin_all
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- Policy 11: Allow authenticated admin users full access to order_items
DROP POLICY IF EXISTS order_items_admin_all ON order_items;
CREATE POLICY order_items_admin_all
  ON order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- Policy 12: Allow authenticated admin users full access to contact_inquiries
DROP POLICY IF EXISTS contact_inquiries_admin_all ON contact_inquiries;
CREATE POLICY contact_inquiries_admin_all
  ON contact_inquiries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- Policy 13: Allow authenticated admin users full access to reviews (Step 32)
DROP POLICY IF EXISTS reviews_admin_all ON reviews;
CREATE POLICY reviews_admin_all
  ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- Policy 14: Customer can SELECT own profile (Step 31)
DROP POLICY IF EXISTS customer_profiles_select_own ON customer_profiles;
CREATE POLICY customer_profiles_select_own
  ON customer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy 15: Customer can INSERT own profile (Step 31)
DROP POLICY IF EXISTS customer_profiles_insert_own ON customer_profiles;
CREATE POLICY customer_profiles_insert_own
  ON customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 16: Customer can UPDATE own profile (Step 31)
DROP POLICY IF EXISTS customer_profiles_update_own ON customer_profiles;
CREATE POLICY customer_profiles_update_own
  ON customer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 17: Authenticated admin users full access to customer profiles (Step 31)
DROP POLICY IF EXISTS customer_profiles_admin_all ON customer_profiles;
CREATE POLICY customer_profiles_admin_all
  ON customer_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  );

-- Policy 18: Customer can SELECT own orders (Step 31)
DROP POLICY IF EXISTS orders_customer_select_own ON orders;
CREATE POLICY orders_customer_select_own
  ON orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- Policy 19: Customer can manage own reviews (Step 31)
DROP POLICY IF EXISTS reviews_customer_insert ON reviews;
CREATE POLICY reviews_customer_insert
  ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

DROP POLICY IF EXISTS reviews_customer_select_own ON reviews;
CREATE POLICY reviews_customer_select_own
  ON reviews
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS reviews_customer_update_own ON reviews;
CREATE POLICY reviews_customer_update_own
  ON reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS reviews_customer_delete_own ON reviews;
CREATE POLICY reviews_customer_delete_own
  ON reviews
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

-- Policy 20: Customer can SELECT own order items (Step 31)
DROP POLICY IF EXISTS order_items_customer_select_own ON order_items;
CREATE POLICY order_items_customer_select_own
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );
