import crypto from 'crypto';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

/**
 * Checks if Razorpay credentials are fully configured.
 * @returns {boolean}
 */
export function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_SECRET
  );
}

/**
 * Instantiates the Razorpay SDK instance safely.
 * @returns {Razorpay|null}
 */
export function getRazorpayInstance() {
  if (!isRazorpayConfigured()) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * Creates a Razorpay payment order for an authoritative amount.
 * @param {Object} params
 * @param {string} params.orderId - Internal DB order UUID
 * @param {string} params.orderNumber - Human-readable order number (e.g. ORD-...)
 * @param {number} params.amountInRupees - Order total in INR
 * @returns {Promise<{ success: boolean, razorpayOrder?: Object, keyId?: string, error?: string }>}
 */
export async function createRazorpayOrder({ orderId, orderNumber, amountInRupees }) {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return {
        success: false,
        error: 'Payment gateway is not configured.',
      };
    }

    const amountInPaise = Math.round(Number(amountInRupees) * 100);
    if (isNaN(amountInPaise) || amountInPaise <= 0) {
      return {
        success: false,
        error: 'Invalid order total for payment.',
      };
    }

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(orderNumber).slice(0, 40),
      notes: {
        app_order_id: String(orderId),
        order_number: String(orderNumber),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Persist razorpay_order_id onto internal order record
    const supabase = await createClient();
    await supabase
      .from('orders')
      .update({ razorpay_order_id: razorpayOrder.id })
      .eq('id', orderId);

    return {
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (err) {
    console.error('Error creating Razorpay order:', err.message);
    return {
      success: false,
      error: err.message || 'Failed to initiate payment gateway order.',
    };
  }
}

/**
 * Verifies the Razorpay payment HMAC SHA256 signature using timingSafeEqual.
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {boolean}
 */
export function verifyPaymentSignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  try {
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return false;
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const sigBuffer = Buffer.from(razorpay_signature, 'utf8');
    const genBuffer = Buffer.from(generatedSignature, 'utf8');

    if (sigBuffer.length !== genBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, genBuffer);
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return false;
  }
}

/**
 * Verifies a Razorpay Webhook signature against raw request body.
 * @param {string} rawBody
 * @param {string} signature
 * @returns {boolean}
 */
export function verifyWebhookSignature(rawBody, signature) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !rawBody || !signature) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const genBuffer = Buffer.from(expectedSignature, 'utf8');

    if (sigBuffer.length !== genBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(sigBuffer, genBuffer);
  } catch (err) {
    console.error('Webhook signature verification error:', err.message);
    return false;
  }
}

/**
 * Sets payment_status = 'paid', records payment details, and marks order confirmed.
 * @param {Object} params
 * @param {string} params.razorpay_order_id
 * @param {string} params.razorpay_payment_id
 * @param {string} params.razorpay_signature
 * @returns {Promise<{ success: boolean, order?: Object, error?: string }>}
 */
export async function recordPaymentSuccess({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  try {
    const supabase = await createClient();

    // 1. Fetch order by razorpay_order_id
    const { data: order, error: fetchErr } = await supabase
      .from('orders')
      .select('*')
      .eq('razorpay_order_id', razorpay_order_id)
      .maybeSingle();

    if (fetchErr || !order) {
      return { success: false, error: 'Order not found for given payment reference.' };
    }

    // 2. If already paid, return existing order (idempotent)
    if (order.payment_status === 'paid') {
      return { success: true, order };
    }

    // 3. Update payment status to paid
    const { data: updatedOrder, error: updateErr } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: order.status === 'pending' ? 'confirmed' : order.status,
        razorpay_payment_id,
        razorpay_signature,
        payment_verified_at: new Date().toISOString(),
      })
      .eq('id', order.id)
      .select()
      .maybeSingle();

    if (updateErr) {
      console.error('Error recording payment success:', updateErr.message);
      return { success: false, error: 'Failed to update order payment status.' };
    }

    return { success: true, order: updatedOrder };
  } catch (err) {
    console.error('Unexpected error in recordPaymentSuccess:', err.message);
    return { success: false, error: 'Server error updating payment status.' };
  }
}

/**
 * Marks order payment as failed.
 * @param {string} razorpay_order_id
 * @returns {Promise<{ success: boolean }>}
 */
export async function recordPaymentFailure(razorpay_order_id) {
  try {
    const supabase = await createClient();
    await supabase
      .from('orders')
      .update({ payment_status: 'failed' })
      .eq('razorpay_order_id', razorpay_order_id)
      .neq('payment_status', 'paid'); // Do not overwrite if already confirmed paid

    return { success: true };
  } catch (err) {
    console.error('Error recording payment failure:', err.message);
    return { success: false };
  }
}

/**
 * Handles Webhook event idempotency by checking and logging event_id.
 * @param {Object} params
 * @param {string} params.eventId
 * @param {string} params.eventType
 * @param {Object} params.payload
 * @returns {Promise<boolean>} True if newly recorded, False if duplicate
 */
export async function recordWebhookEvent({ eventId, eventType, payload }) {
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from('payment_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      return false; // Already processed
    }

    await supabase.from('payment_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      payload,
    });

    return true;
  } catch (err) {
    console.error('Error recording webhook event:', err.message);
    return false;
  }
}
