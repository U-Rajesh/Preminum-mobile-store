import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  recordPaymentSuccess,
  recordPaymentFailure,
  recordWebhookEvent,
} from '@/lib/services/payments';
import { createClient } from '@/lib/supabase/server';

export async function POST(request) {
  try {
    const signature = request.headers.get('x-razorpay-signature');
    const rawBody = await request.text();

    if (!signature || !rawBody) {
      return NextResponse.json(
        { success: false, message: 'Missing signature or payload.' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid webhook signature.' },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventId = event?.event_id || event?.id || `${event.event}_${Date.now()}`;
    const eventType = event.event;

    // Ensure idempotency
    const isNew = await recordWebhookEvent({
      eventId,
      eventType,
      payload: event,
    });

    if (!isNew) {
      // Event has already been processed safely
      return NextResponse.json({ status: 'ok', message: 'Event already processed' }, { status: 200 });
    }

    const payload = event?.payload;

    if (eventType === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId && razorpayPaymentId) {
        await recordPaymentSuccess({
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: signature,
        });
      }
    } else if (eventType === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        await recordPaymentFailure(razorpayOrderId);
      }
    } else if (eventType === 'refund.created' || eventType === 'refund.processed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;

      if (razorpayOrderId) {
        const supabase = await createClient();
        await supabase
          .from('orders')
          .update({ payment_status: 'refunded' })
          .eq('razorpay_order_id', razorpayOrderId);
      }
    }

    return NextResponse.json({ status: 'ok', received: true }, { status: 200 });
  } catch (err) {
    console.error('Error processing Razorpay webhook:', err.message);
    return NextResponse.json(
      { success: false, message: 'Webhook processing error.' },
      { status: 500 }
    );
  }
}
