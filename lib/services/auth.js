import { createClient as createServerSupabase } from '@/lib/supabase/server';
import { createClient as createSupabaseJs } from '@supabase/supabase-js';

/**
 * Retrieves the currently authenticated Supabase user.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;
    return user;
  } catch (err) {
    console.error('Error fetching current user:', err.message);
    return null;
  }
}

/**
 * Verifies if the request originates from an authenticated user with admin authorization.
 * Checks the database `admin_users` table and token metadata.
 * @param {string|null} [token]
 * @returns {Promise<{ authorized: boolean, reason?: string, user?: Object, role?: string, supabase?: Object }>}
 */
export async function verifyAdminUser(token = null) {
  try {
    let supabase;
    let user = null;

    if (token) {
      supabase = createSupabaseJs(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          global: { headers: { Authorization: `Bearer ${token}` } },
        }
      );
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        return { authorized: false, reason: 'unauthenticated' };
      }
      user = data.user;
    } else {
      supabase = await createServerSupabase();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        return { authorized: false, reason: 'unauthenticated' };
      }
      user = data.user;
    }

    // 1. Check direct role in auth token metadata (e.g. set by Supabase Auth / custom claims)
    if (
      user.app_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'admin'
    ) {
      return {
        authorized: true,
        user,
        role: user.app_metadata?.role || user.user_metadata?.role || 'admin',
      };
    }

    // 2. Query admin_users table for user record
    const { data: adminRecord, error: dbErr } = await supabase
      .from('admin_users')
      .select('id, email, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!dbErr && adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
      return {
        authorized: true,
        user,
        role: adminRecord.role,
      };
    }

    return { authorized: false, reason: 'unauthorized', user };
  } catch (err) {
    console.error('Unexpected error in verifyAdminUser:', err.message);
    return { authorized: false, reason: 'unauthenticated' };
  }
}
