-- ==============================================================================
-- Step 25 Migration: Missing Tables, Triggers, Indexes & RLS Policies
-- Execute this script in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. CONTACT INQUIRIES TABLE
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

-- Trigger function for contact_inquiries updated_at
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

-- Enable RLS on contact_inquiries
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;


-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
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

-- Trigger function for orders updated_at
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

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;


-- 3. ORDER ITEMS TABLE
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

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;


-- 4. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;


-- 5. PAYMENT WEBHOOK EVENTS TABLE
CREATE TABLE IF NOT EXISTS payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for payment_webhook_events
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON payment_webhook_events(event_id);

-- Enable RLS on payment_webhook_events
ALTER TABLE payment_webhook_events ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- Policy 4: Allow public/anonymous users to INSERT contact inquiries
DROP POLICY IF EXISTS contact_inquiries_public_insert ON contact_inquiries;
CREATE POLICY contact_inquiries_public_insert
  ON contact_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 5: Allow public/anonymous users to INSERT orders
DROP POLICY IF EXISTS orders_public_insert ON orders;
CREATE POLICY orders_public_insert
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 6: Allow public/anonymous users to INSERT order items
DROP POLICY IF EXISTS order_items_public_insert ON order_items;
CREATE POLICY order_items_public_insert
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Policy 7: Allow authenticated admin users to SELECT their own admin record
DROP POLICY IF EXISTS admin_users_select_self ON admin_users;
CREATE POLICY admin_users_select_self
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
