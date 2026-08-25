'use client';

import Link from 'next/link';
import { ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const { isAdmin } = useAuth();
  const { cartItems, isLoaded } = useCart();

  if (isAdmin) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard} style={{ maxWidth: '560px', margin: '40px auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <ShieldCheck size={36} aria-hidden="true" />
            </div>
            <h1 className={styles.emptyTitle}>Admin Account Active</h1>
            <p className={styles.emptyText}>
              Customer checkout is unavailable for administrator accounts. You can manage orders and customer inquiries from the Admin Dashboard.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px', flexWrap: 'wrap' }}>
              <Link href="/admin" className="btn btn-primary">
                <ShieldCheck size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
                <span>Go to Admin Dashboard</span>
              </Link>
              <Link href="/mobiles" className="btn btn-outline">
                <span>Browse Mobiles</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prevent flash during initial localStorage restore
  if (!isLoaded) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--color-muted)' }}>
            Loading checkout...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.emptyCard}>
            <ShoppingBag size={56} className={styles.emptyIcon} aria-hidden="true" />
            <h1 className={styles.emptyTitle}>Your cart is empty</h1>
            <p className={styles.emptyText}>
              You have no items in your shopping cart. Browse our catalog to select
              your next smartphone.
            </p>
            <Link href="/mobiles" className="btn btn-primary">
              <ArrowLeft size={16} aria-hidden="true" style={{ marginRight: '6px' }} />
              <span>Explore Mobiles</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <header className={styles.header}>
          <span className={styles.eyebrow}>Secure Checkout</span>
          <h1 className={styles.title}>Complete Your Order</h1>
        </header>

        {/* Real Interactive Checkout Form */}
        <CheckoutForm />
      </div>
    </div>
  );
}
