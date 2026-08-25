import { NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/services/auth';
import { getAdminInquiries } from '@/lib/services/admin';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const auth = await verifyAdminUser(token);
    if (!auth.authorized) {
      const status = auth.reason === 'unauthenticated' ? 401 : 403;
      const message =
        auth.reason === 'unauthenticated'
          ? 'Unauthorized: Authentication required.'
          : 'Forbidden: Admin access required.';
      return NextResponse.json({ success: false, message }, { status });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';

    const inquiries = await getAdminInquiries({ search, status }, token);

    return NextResponse.json(
      {
        success: true,
        inquiries,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err) {
    console.error('Error in GET /api/admin/inquiries:', err.message);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving inquiries' },
      { status: 500 }
    );
  }
}
