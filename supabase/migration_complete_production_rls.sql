-- ==============================================================================
-- MOBILÉ eCommerce — Complete Production RLS Migration
-- Run this script in the Supabase SQL Editor to unify admin policies across all tables.
-- ==============================================================================

-- 1. ADMIN USERS TABLE POLICIES
DROP POLICY IF EXISTS admin_users_select_self ON public.admin_users;
CREATE POLICY admin_users_select_self
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS admin_users_insert_self ON public.admin_users;
CREATE POLICY admin_users_insert_self
  ON public.admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. MOBILES TABLE POLICIES
DROP POLICY IF EXISTS mobiles_public_select ON public.mobiles;
CREATE POLICY mobiles_public_select
  ON public.mobiles
  FOR SELECT
  TO public
  USING (is_hidden = false);

DROP POLICY IF EXISTS mobiles_admin_all ON public.mobiles;
CREATE POLICY mobiles_admin_all
  ON public.mobiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- 3. MOBILE IMAGES TABLE POLICIES
DROP POLICY IF EXISTS mobile_images_public_select ON public.mobile_images;
CREATE POLICY mobile_images_public_select
  ON public.mobile_images
  FOR SELECT
  TO public
  USING (
    EXISTS (
      SELECT 1 FROM public.mobiles
      WHERE mobiles.id = mobile_images.mobile_id
        AND mobiles.is_hidden = false
    )
  );

DROP POLICY IF EXISTS mobile_images_admin_all ON public.mobile_images;
CREATE POLICY mobile_images_admin_all
  ON public.mobile_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- 4. ORDERS TABLE POLICIES
DROP POLICY IF EXISTS orders_public_insert ON public.orders;
CREATE POLICY orders_public_insert
  ON public.orders
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS orders_customer_select_own ON public.orders;
CREATE POLICY orders_customer_select_own
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_admin_all
  ON public.orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- 5. ORDER ITEMS TABLE POLICIES
DROP POLICY IF EXISTS order_items_public_insert ON public.order_items;
CREATE POLICY order_items_public_insert
  ON public.order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS order_items_customer_select_own ON public.order_items;
CREATE POLICY order_items_customer_select_own
  ON public.order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.customer_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
CREATE POLICY order_items_admin_all
  ON public.order_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- 6. REVIEWS TABLE POLICIES
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
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );

-- 7. CONTACT INQUIRIES TABLE POLICIES
DROP POLICY IF EXISTS contact_inquiries_public_insert ON public.contact_inquiries;
CREATE POLICY contact_inquiries_public_insert
  ON public.contact_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

DROP POLICY IF EXISTS contact_inquiries_admin_all ON public.contact_inquiries;
CREATE POLICY contact_inquiries_admin_all
  ON public.contact_inquiries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE admin_users.id = auth.uid()
        AND (admin_users.role = 'admin' OR admin_users.role = 'superadmin')
    )
    OR ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin'))
    OR ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin'))
  );
