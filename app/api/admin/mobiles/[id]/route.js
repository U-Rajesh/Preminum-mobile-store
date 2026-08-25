import { NextResponse } from 'next/server';
import { updateMobile, deleteMobile } from '@/lib/services/admin';
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

    const { brand, name, price, original_price, ram, storage, images } = body;
    const errors = {};

    if (!brand?.trim()) errors.brand = 'Brand is required.';
    if (!name?.trim()) errors.name = 'Mobile name is required.';
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      errors.price = 'Valid non-negative price is required.';
    }
    if (original_price && (isNaN(Number(original_price)) || Number(original_price) < 0)) {
      errors.original_price = 'Original price must be a valid positive number.';
    }
    if (!ram?.trim()) errors.ram = 'RAM specification is required.';
    if (!storage?.trim()) errors.storage = 'Storage specification is required.';

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ success: false, message: 'Validation failed', errors }, { status: 400 });
    }

    const result = await updateMobile(id, body, images, token);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to update mobile' }, { status: 500 });
    }

    return NextResponse.json({ success: true, mobile: result.mobile }, { status: 200 });
  } catch (err) {
    console.error('Error in PATCH /api/admin/mobiles/[id]:', err.message);
    return NextResponse.json({ success: false, message: 'Server error updating mobile' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
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
    const result = await deleteMobile(id, token);
    if (!result.success) {
      const status =
        result.code === 'MOBILE_NOT_DELETED' ? 404 :
        result.code === '42501' ? 403 :
        result.code === '23503' ? 409 :
        400;

      return NextResponse.json(
        { success: false, message: result.error || 'Failed to delete mobile', code: result.code },
        { status }
      );
    }
    return NextResponse.json({ success: true, message: 'Mobile deleted successfully' }, { status: 200 });
  } catch (err) {
    console.error('Error in DELETE /api/admin/mobiles/[id]:', err.message);
    return NextResponse.json({ success: false, message: 'Server error deleting mobile' }, { status: 500 });
  }
}
