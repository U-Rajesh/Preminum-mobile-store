import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase environment variables are missing, redirect to login or return 401 for API
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Authentication service unavailable.' },
        { status: 401 }
      );
    }
    if (
      request.nextUrl.pathname.startsWith('/admin') &&
      request.nextUrl.pathname !== '/admin/login' &&
      request.nextUrl.pathname !== '/admin/unauthorized'
    ) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
    return response;
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  let user = null;
  let supabase = null;

  if (bearerToken) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
      auth: { persistSession: false },
    });
    const { data } = await supabase.auth.getUser(bearerToken);
    user = data?.user || null;
  } else {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  }

  const { pathname } = request.nextUrl;

  // Helper to check admin status
  let isAdmin = false;
  if (user) {
    if (
      user.app_metadata?.role === 'admin' ||
      user.app_metadata?.role === 'superadmin' ||
      user.user_metadata?.role === 'admin'
    ) {
      isAdmin = true;
    } else {
      const { data: adminRecord } = await supabase
        .from('admin_users')
        .select('id, role')
        .eq('id', user.id)
        .maybeSingle();

      if (adminRecord && (adminRecord.role === 'admin' || adminRecord.role === 'superadmin')) {
        isAdmin = true;
      }
    }
  }

  // 1. Guard API admin endpoints: /api/admin/*
  if (pathname.startsWith('/api/admin')) {
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Admin privileges required.' },
        { status: 403 }
      );
    }
    return response;
  }

  // 2. Guard Admin UI routes: /admin/*
  if (pathname === '/admin/login') {
    if (user && isAdmin) {
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/admin';
      return NextResponse.redirect(dashboardUrl);
    }
    return response;
  }

  if (pathname === '/admin/unauthorized') {
    return response;
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      const unauthorizedUrl = request.nextUrl.clone();
      unauthorizedUrl.pathname = '/admin/unauthorized';
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 3. Guard Customer Account route: /account
  if (pathname.startsWith('/account')) {
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/account/:path*'],
};
