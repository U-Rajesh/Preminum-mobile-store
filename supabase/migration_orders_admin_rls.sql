-- ==============================================================================
-- MOBILÉ eCommerce — Complete Orders & Order Items RLS Migration
-- Run this script in the Supabase SQL Editor to grant admin users full management
-- access to all orders and line items.
-- ==============================================================================

-- 1. ORDERS TABLE POLICIES
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

-- 2. ORDER ITEMS TABLE POLICIES
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

-- 3. ENSURE ADMIN USERS ARE SYNCED TO public.admin_users (Optional helper)
-- INSERT INTO public.admin_users (id, email, role)
-- SELECT id, email, 'admin'
-- FROM auth.users
-- WHERE email = 'admin@mobile-store.com'
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
