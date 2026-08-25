import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerProfile, upsertCustomerProfile } from '@/lib/services/customers';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const supabase = await createClient(token);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const user = authData.user;
    let profile = await getCustomerProfile(user.id);

    // If profile row doesn't exist yet, return user metadata
    if (!profile) {
      profile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
      };
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at || user.created_at,
      },
    });
  } catch (err) {
    console.error('Error in GET /api/customers/profile:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve customer profile.' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const supabase = await createClient(token);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const fullName = body?.fullName || body?.full_name;
    const phone = body?.phone;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    const result = await upsertCustomerProfile(authData.user.id, {
      fullName: fullName.trim(),
      phone: phone ? String(phone).trim() : null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to save customer profile.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, profile: result.profile },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in POST /api/customers/profile:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const supabase = await createClient(token);
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData?.user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const fullName = body?.fullName || body?.full_name;
    const phone = body?.phone;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: 'Full name is required.' },
        { status: 400 }
      );
    }

    const result = await upsertCustomerProfile(authData.user.id, {
      fullName: fullName.trim(),
      phone: phone ? String(phone).trim() : null,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to update customer profile.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, profile: result.profile },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in PATCH /api/customers/profile:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error.' },
      { status: 500 }
    );
  }
}
