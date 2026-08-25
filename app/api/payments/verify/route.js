import { NextResponse } from 'next/server';
import {
  verifyPaymentSignature,
  recordPaymentSuccess,
  recordPaymentFailure,
  isRazorpayConfigured,
} from '@/lib/services/payments';

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload.' },
        { status: 400 }
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required Razorpay payment verification parameters.',
        },
        { status: 400 }
      );
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { success: false, message: 'Payment gateway is not configured.' },
        { status: 503 }
      );
    }

    // Cryptographic signature verification
    const isSignatureValid = verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isSignatureValid) {
      // Record failed attempt against order
      await recordPaymentFailure(razorpay_order_id);

      return NextResponse.json(
        {
          success: false,
          message: 'Payment verification failed: Invalid cryptographic signature.',
        },
        { status: 400 }
      );
    }

    // Signature is valid -> persist payment and mark order paid
    const result = await recordPaymentSuccess({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error || 'Failed to confirm order payment.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Payment verified and order confirmed.',
        order: result.order,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in POST /api/payments/verify:', err.message);
    return NextResponse.json(
      { success: false, message: 'Internal server error verifying payment.' },
      { status: 500 }
    );
  }
}
