import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/services/admin';
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

    if (!body || typeof body !== 'object') {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    const { status, payment_status } = body;
    const result = await updateOrderStatus(id, { status, payment_status }, token);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to update order status' }, { status: 400 });
    }

    return NextResponse.json({ success: true, order: result.order }, { status: 200 });
  } catch (err) {
    console.error('Error in PATCH /api/admin/orders/[id]:', err.message);
    return NextResponse.json({ success: false, message: 'Server error updating order' }, { status: 500 });
  }
}
