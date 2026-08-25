-- ==============================================================================
-- MOBILÉ eCommerce — Migration Step 31: Customer Profiles, Orders & Reviews
-- Run this migration in the Supabase SQL Editor.
-- ==============================================================================

-- 1. Create customer_profiles table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT chk_customer_profiles_name_not_empty CHECK (char_length(trim(full_name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_customer_profiles_created_at ON public.customer_profiles(created_at DESC);
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Add customer_id foreign key column to orders if not present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.orders
      ADD COLUMN customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);

-- 3. Enhance reviews table with mobile_id, customer_id, and title columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'mobile_id'
  ) THEN
    ALTER TABLE public.reviews
      ADD COLUMN mobile_id UUID REFERENCES public.mobiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'customer_id'
  ) THEN
    ALTER TABLE public.reviews
      ADD COLUMN customer_id UUID REFERENCES public.customer_profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reviews' AND column_name = 'title'
  ) THEN
    ALTER TABLE public.reviews
      ADD COLUMN title TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reviews_mobile_id ON public.reviews(mobile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer_id ON public.reviews(customer_id);

-- 4. RLS Policies for customer_profiles
DROP POLICY IF EXISTS customer_profiles_select_own ON public.customer_profiles;
CREATE POLICY customer_profiles_select_own
  ON public.customer_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS customer_profiles_insert_own ON public.customer_profiles;
CREATE POLICY customer_profiles_insert_own
  ON public.customer_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS customer_profiles_update_own ON public.customer_profiles;
CREATE POLICY customer_profiles_update_own
  ON public.customer_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS customer_profiles_admin_all ON public.customer_profiles;
CREATE POLICY customer_profiles_admin_all
  ON public.customer_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  );

-- 5. RLS Policies on orders for customer visibility
DROP POLICY IF EXISTS orders_customer_select_own ON public.orders;
CREATE POLICY orders_customer_select_own
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

-- 6. RLS Policies on reviews
DROP POLICY IF EXISTS reviews_public_select_visible ON public.reviews;
CREATE POLICY reviews_public_select_visible
  ON public.reviews
  FOR SELECT
  TO public
  USING (is_hidden = false);

DROP POLICY IF EXISTS reviews_customer_insert ON public.reviews;
CREATE POLICY reviews_customer_insert
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid() OR customer_id IS NULL);

DROP POLICY IF EXISTS reviews_customer_select_own ON public.reviews;
CREATE POLICY reviews_customer_select_own
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS reviews_customer_update_own ON public.reviews;
CREATE POLICY reviews_customer_update_own
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (customer_id = auth.uid())
  WITH CHECK (customer_id = auth.uid());

DROP POLICY IF EXISTS reviews_customer_delete_own ON public.reviews;
CREATE POLICY reviews_customer_delete_own
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS reviews_admin_all ON public.reviews;
CREATE POLICY reviews_admin_all
  ON public.reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
  );
