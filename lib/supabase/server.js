import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates an authenticated Supabase server client for Server Components, Server Actions, and Route Handlers.
 * @param {string|null} [accessToken]
 * @returns {Promise<import('@supabase/supabase-js').SupabaseClient>}
 */
export async function createClient(accessToken = null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or empty in .env.local."
    );
  }

  if (accessToken) {
    return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: { persistSession: false },
    });
  }

  let cookieStore = null;
  try {
    cookieStore = await cookies();
  } catch {
    // Context where cookies() is unavailable
  }

  const options = {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Ignored when called from Server Component during render
        }
      },
    },
  };

  return createServerClient(supabaseUrl, supabaseAnonKey, options);
}
