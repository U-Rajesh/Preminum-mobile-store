-- MOBILÉ production fix: Admin RLS policies
-- Run this ONCE in Supabase SQL Editor if admin pages load but
-- admin create/update/delete operations return PGRST116 or affect 0 rows.
--
-- This migration is safe to re-run.

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;

-- Admin user can read their own admin record. The admin policies below
-- use this row to authorize CRUD operations.
DROP POLICY IF EXISTS admin_users_select_self ON public.admin_users;
CREATE POLICY admin_users_select_self
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- MOBILES
DROP POLICY IF EXISTS mobiles_public_select_visible ON public.mobiles;
CREATE POLICY mobiles_public_select_visible
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
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- MOBILE IMAGES
DROP POLICY IF EXISTS mobile_images_public_select_visible_mobile ON public.mobile_images;
DROP POLICY IF EXISTS mobile_images_public_select ON public.mobile_images;
CREATE POLICY mobile_images_public_select
ON public.mobile_images
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1
    FROM public.mobiles m
    WHERE m.id = mobile_images.mobile_id
      AND m.is_hidden = false
  )
);

DROP POLICY IF EXISTS mobile_images_admin_all ON public.mobile_images;
CREATE POLICY mobile_images_admin_all
ON public.mobile_images
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- ORDERS
DROP POLICY IF EXISTS orders_admin_all ON public.orders;
CREATE POLICY orders_admin_all
ON public.orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- ORDER ITEMS
DROP POLICY IF EXISTS order_items_admin_all ON public.order_items;
CREATE POLICY order_items_admin_all
ON public.order_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- REVIEWS
DROP POLICY IF EXISTS reviews_public_select_visible ON public.reviews;
CREATE POLICY reviews_public_select_visible
ON public.reviews
FOR SELECT
TO public
USING (is_hidden = false);

DROP POLICY IF EXISTS reviews_admin_all ON public.reviews;
CREATE POLICY reviews_admin_all
ON public.reviews
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- CONTACT INQUIRIES
DROP POLICY IF EXISTS contact_inquiries_admin_all ON public.contact_inquiries;
CREATE POLICY contact_inquiries_admin_all
ON public.contact_inquiries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- CUSTOMER PROFILES (admin access)
DROP POLICY IF EXISTS customer_profiles_admin_all ON public.customer_profiles;
CREATE POLICY customer_profiles_admin_all
ON public.customer_profiles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.admin_users au
    WHERE au.id = auth.uid()
      AND au.role IN ('admin', 'superadmin')
  )
  OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'superadmin')
  OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'superadmin')
);

-- Verify the logged-in admin is actually present.
-- Run this separately if needed:
-- SELECT id, email, role FROM public.admin_users WHERE id = auth.uid();
