'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Home, Smartphone, ShieldCheck, CreditCard, ShoppingBag, Truck } from 'lucide-react';
import styles from './order-success.module.css';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');
  const paymentStatus = searchParams.get('payment');
  const paymentId = searchParams.get('payment_id');

  const isPaid = paymentStatus === 'paid';
  const isCod = paymentStatus === 'cod' || !paymentStatus || paymentStatus === 'unconfigured';

  return (
    <div className={styles.card}>
      <div className={styles.iconWrapper}>
        <CheckCircle2 size={36} aria-hidden="true" />
      </div>

      <h1 className={styles.title}>
        {isPaid ? 'Payment Successful' : 'Order Confirmed'}
      </h1>
      <p className={styles.subtitle}>
        {isPaid
          ? 'Thank you for shopping with MOBILÉ. Your payment has been securely verified and your order is confirmed.'
          : 'Thank you for shopping with MOBILÉ. Your order has been placed with Cash on Delivery and is currently being processed.'}
      </p>

      {orderNumber && (
        <div className={styles.orderBox}>
          <div>
            <span className={styles.orderLabel}>Order Reference</span>
            <div className={styles.orderNumber}>{orderNumber}</div>
          </div>

          <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--color-border-subtle)' }}>
            <span className={styles.orderLabel}>Payment Status</span>
            <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: isPaid ? '#15803d' : '#92400e', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              {isPaid ? (
                <>
                  <CheckCircle2 size={16} color="#15803d" />
                  <span>Paid / Online Verified</span>
                </>
              ) : (
                <>
                  <Truck size={16} color="#92400e" />
                  <span>Pending / Cash on Delivery</span>
                </>
              )}
            </div>
          </div>

          {isPaid && paymentId && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)' }}>
              <span className={styles.orderLabel}>Razorpay Payment ID</span>
              <div style={{ fontSize: '0.875rem', fontWeight: 'var(--font-weight-semibold)', color: '#15803d', fontFamily: 'monospace' }}>
                {paymentId}
              </div>
            </div>
          )}

          {isCod && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border-subtle)', fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
              💵 Please keep the exact invoice amount ready in cash when the courier executive delivers your parcel.
            </div>
          )}

          <div className={styles.detailsList}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="#15803d" aria-hidden="true" />
              <span>Includes MOBILÉ Store Warranty & 7-Day Replacement Policy</span>
            </div>
            <span>• Free express courier tracking will be shared via email and SMS.</span>
            <span>• Expected delivery within 2–4 business days across India.</span>
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Link
          href="/account"
          className="btn btn-primary"
          style={{ height: '48px', padding: '0 24px', justifyContent: 'center' }}
        >
          <ShoppingBag size={18} aria-hidden="true" style={{ marginRight: '6px' }} />
          <span>View in My Orders</span>
        </Link>

        <Link
          href="/mobiles"
          className="btn btn-outline"
          style={{ height: '48px', padding: '0 24px', justifyContent: 'center' }}
        >
          <Smartphone size={18} aria-hidden="true" style={{ marginRight: '6px' }} />
          <span>Explore More Mobiles</span>
        </Link>

        <Link
          href="/"
          className="btn btn-outline"
          style={{ height: '48px', padding: '0 24px', justifyContent: 'center' }}
        >
          <Home size={18} aria-hidden="true" style={{ marginRight: '6px' }} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.container}`}>
        <Suspense
          fallback={
            <div className={styles.card}>
              <div style={{ padding: '40px 0', color: 'var(--color-muted)' }}>
                Loading order confirmation...
              </div>
            </div>
          }
        >
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
