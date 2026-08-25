'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';

const AuthContext = createContext({
  user: null,
  session: null,
  isAuthenticated: false,
  isAdmin: false,
  role: 'guest',
  isLoading: true,
  signOut: async () => {},
  refreshAuth: async () => {},
});

/**
 * Checks whether a given Supabase user has administrative privileges.
 * First inspects JWT app_metadata / user_metadata, then checks the database `admin_users` table.
 * @param {Object|null} user
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<{ isAdmin: boolean, role: string }>}
 */
async function resolveUserRole(user, supabase) {
  if (!user || !user.id) {
    return { isAdmin: false, role: 'guest' };
  }

  // 1. Check direct role in auth token metadata (app_metadata / user_metadata)
  const metaRole =
    user.app_metadata?.role ||
    user.user_metadata?.role;

  if (metaRole === 'admin' || metaRole === 'superadmin') {
    return { isAdmin: true, role: metaRole };
  }

  // 2. Query admin_users database table
  try {
    const { data: adminRecord, error } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (!error && adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
      return { isAdmin: true, role: adminRecord.role };
    }
  } catch (err) {
    console.error('Error resolving admin role from database:', err);
  }

  return { isAdmin: false, role: 'customer' };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [role, setRole] = useState('guest');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = useMemo(() => {
    try {
      return createClient();
    } catch {
      return null;
    }
  }, []);

  const evaluateAuthState = useCallback(async (currentSession) => {
    if (!supabase) {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setRole('guest');
      setIsLoading(false);
      return;
    }

    const currentUser = currentSession?.user || null;
    setSession(currentSession || null);
    setUser(currentUser);

    if (!currentUser) {
      setIsAdmin(false);
      setRole('guest');
      setIsLoading(false);
      return;
    }

    const roleInfo = await resolveUserRole(currentUser, supabase);
    setIsAdmin(roleInfo.isAdmin);
    setRole(roleInfo.role);
    setIsLoading(false);
  }, [supabase]);

  const refreshAuth = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data } = await supabase.auth.getSession();
      await evaluateAuthState(data?.session);
    } catch (err) {
      console.error('Error refreshing auth:', err);
    }
  }, [supabase, evaluateAuthState]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setRole('guest');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Initial session lookup
    supabase.auth.getSession().then(({ data }) => {
      if (isMounted) {
        evaluateAuthState(data?.session);
      }
    }).catch(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    });

    // Real-time listener for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (isMounted) {
        evaluateAuthState(newSession);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabase, evaluateAuthState]);

  const value = useMemo(() => ({
    user,
    session,
    isAuthenticated: Boolean(user),
    isAdmin,
    role,
    isLoading,
    signOut,
    refreshAuth,
  }), [user, session, isAdmin, role, isLoading, signOut, refreshAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
