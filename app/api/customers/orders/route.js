import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCustomerOrders } from '@/lib/services/customers';

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

    const orders = await getCustomerOrders(authData.user.id);

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error('Error in GET /api/customers/orders:', err);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve customer orders.' },
      { status: 500 }
    );
  }
}
