import { NextResponse } from 'next/server';
import { verifyAdminUser } from '@/lib/services/auth';
import { toggleReviewVisibility, deleteReview } from '@/lib/services/reviews';

export async function PATCH(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminCheck = await verifyAdminUser(token);
    if (!adminCheck.authorized) {
      const status = adminCheck.reason === 'unauthenticated' ? 401 : 403;
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status }
      );
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const isHidden = typeof body.is_hidden === 'boolean' ? body.is_hidden : false;

    const result = await toggleReviewVisibility(id, isHidden, token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to update review visibility.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: isHidden ? 'Review is now hidden.' : 'Review is now visible.',
    });
  } catch (err) {
    console.error('Error in PATCH /api/admin/reviews/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminCheck = await verifyAdminUser(token);
    if (!adminCheck.authorized) {
      const status = adminCheck.reason === 'unauthenticated' ? 401 : 403;
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status }
      );
    }

    const { id } = await params;
    const result = await deleteReview(id, token);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to delete review.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Review permanently deleted.',
    });
  } catch (err) {
    console.error('Error in DELETE /api/admin/reviews/[id]:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
