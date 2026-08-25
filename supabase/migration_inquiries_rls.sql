-- ==============================================================================
-- MOBILÉ eCommerce — Inquiries RLS Policy Migration
-- Run this in the Supabase SQL Editor if inquiries are not displaying for admin users.
-- ==============================================================================

-- 1. Ensure contact_inquiries table exists and has RLS enabled
ALTER TABLE IF EXISTS public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 2. Allow any visitor / customer to submit contact inquiries (INSERT)
DROP POLICY IF EXISTS contact_inquiries_public_insert ON public.contact_inquiries;
CREATE POLICY contact_inquiries_public_insert
  ON public.contact_inquiries
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 3. Allow authenticated admins to SELECT, UPDATE, and DELETE inquiries
-- Checks:
--   a) Record exists in public.admin_users table, OR
--   b) Token app_metadata has role 'admin' or 'superadmin', OR
--   c) Token user_metadata has role 'admin' or 'superadmin'
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

-- 4. Ensure admin_users permissions for authenticated users to check their own role
DROP POLICY IF EXISTS admin_users_select_self ON public.admin_users;
CREATE POLICY admin_users_select_self
  ON public.admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
