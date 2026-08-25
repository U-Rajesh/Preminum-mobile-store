import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getVisibleReviews, getReviewsForMobile, createReview } from '@/lib/services/reviews';
import { getCustomerProfile, upsertCustomerProfile } from '@/lib/services/customers';
import { verifyAdminUser } from '@/lib/services/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const mobileId = searchParams.get('mobile_id') || searchParams.get('mobileId');
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    let reviews = [];
    if (mobileId) {
      reviews = await getReviewsForMobile(mobileId);
    } else {
      reviews = await getVisibleReviews(limit);
    }

    return NextResponse.json({
      success: true,
      reviews,
    });
  } catch (err) {
    console.error('Error in GET /api/reviews:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve reviews.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    // Check if user is an admin
    const adminCheck = await verifyAdminUser(token);
    if (adminCheck.authorized) {
      return NextResponse.json(
        {
          success: false,
          message: 'Admins cannot submit customer product reviews. Manage reviews in the Admin Dashboard.',
        },
        { status: 403 }
      );
    }

    const supabase = await createClient(token);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: 'Please log in to submit a review.' },
        { status: 401 }
      );
    }

    const user = authData.user;
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid review payload.' },
        { status: 400 }
      );
    }

    const { mobileId, rating, title, comment, reviewText } = body;
    const finalComment = reviewText || comment;

    const ratingNum = parseInt(rating, 10);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { success: false, message: 'Rating must be between 1 and 5 stars.' },
        { status: 400 }
      );
    }

    if (!finalComment || !finalComment.trim()) {
      return NextResponse.json(
        { success: false, message: 'Review comment is required.' },
        { status: 400 }
      );
    }

    // Resolve customer's profile or auto-create if missing
    let profile = await getCustomerProfile(user.id);
    if (!profile) {
      const defaultName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Verified Customer';
      const upsertRes = await upsertCustomerProfile(user.id, {
        fullName: defaultName,
        phone: user.user_metadata?.phone || null,
      });
      if (upsertRes.success) {
        profile = upsertRes.profile;
      }
    }

    const customerName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Verified Customer';

    const result = await createReview(
      {
        mobileId: mobileId || null,
        customerId: profile?.id || null,
        customerName,
        customerRole: 'Verified Buyer',
        rating: ratingNum,
        title: title ? title.trim() : null,
        reviewText: finalComment.trim(),
      },
      token
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to submit review.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, review: result.review },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error in POST /api/reviews:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to submit review.' },
      { status: 500 }
    );
  }
}
