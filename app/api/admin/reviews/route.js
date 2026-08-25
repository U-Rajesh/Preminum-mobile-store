import { NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/services/auth';
import { getAdminReviews } from '@/lib/services/reviews';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const auth = await verifyAdminUser(token);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Authentication required.' ? 401 : 403 }
      );
    }

    const reviews = await getAdminReviews({}, token);
    return NextResponse.json({ success: true, reviews });
  } catch (err) {
    console.error('Error in GET /api/admin/reviews:', err.message);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
