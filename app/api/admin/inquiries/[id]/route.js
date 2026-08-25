import { NextResponse } from 'next/server';
import { updateInquiryStatus } from '@/lib/services/admin';
import { verifyAdminUser } from '@/lib/services/auth';

export async function PATCH(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const auth = await verifyAdminUser(token);
    if (!auth.authorized) {
      const status = auth.reason === 'unauthenticated' ? 401 : 403;
      const message = auth.reason === 'unauthenticated'
        ? 'Unauthorized: Authentication required.'
        : 'Forbidden: Admin access required.';
      return NextResponse.json({ success: false, message }, { status });
    }

    const { id } = await params;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object' || !body.status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });
    }

    const result = await updateInquiryStatus(id, body.status, token);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to update inquiry status' }, { status: 400 });
    }

    return NextResponse.json({ success: true, inquiry: result.inquiry, message: 'Inquiry status updated' }, { status: 200 });
  } catch (err) {
    console.error('Error in PATCH /api/admin/inquiries/[id]:', err.message);
    return NextResponse.json({ success: false, message: 'Server error updating inquiry' }, { status: 500 });
  }
}
