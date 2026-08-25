import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for client components running in the browser.
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY) are missing or empty in .env.local."
    );
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
