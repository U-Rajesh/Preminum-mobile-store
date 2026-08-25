import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createRazorpayOrder, isRazorpayConfigured } from '@/lib/services/payments';
import { verifyAdminUser } from '@/lib/services/auth';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const adminCheck = await verifyAdminUser(token);

    if (adminCheck.authorized) {
      return NextResponse.json(
        { success: false, message: 'Admin accounts cannot initiate customer payment orders.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object' || !body.orderId) {
      return NextResponse.json(
        { success: false, message: 'Order reference is required to initiate payment.' },
        { status: 400 }
      );
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        {
          success: false,
          configured: false,
          message: 'Payment gateway is not configured.',
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();

    // Fetch authoritative order from database
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, payment_status')
      .eq('id', body.orderId)
      .maybeSingle();

    if (error || !order) {
      return NextResponse.json(
        { success: false, message: 'Order not found.' },
        { status: 404 }
      );
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json(
        { success: false, message: 'This order has already been paid.' },
        { status: 400 }
      );
    }

    const result = await createRazorpayOrder({
      orderId: order.id,
      orderNumber: order.order_number,
      amountInRupees: order.total_amount,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to create payment order.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      configured: true,
      keyId: result.keyId,
      razorpayOrderId: result.razorpayOrder.id,
      amount: result.razorpayOrder.amount,
      currency: result.razorpayOrder.currency,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error('Error in POST /api/payments/create-order:', err.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error initiating payment.' },
      { status: 500 }
    );
  }
}
