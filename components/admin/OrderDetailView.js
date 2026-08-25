'use client';

import { useState } from 'react';
import Link from 'next/link';
import ExternalImage from '@/components/common/ExternalImage';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, AlertCircle, Smartphone, CreditCard } from 'lucide-react';
import OrderStatusProgress from '@/components/orders/OrderStatusProgress';
import styles from './OrderDetailView.module.css';

/**
 * Formats price to INR currency string.
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function OrderDetailView({ initialOrder }) {
  const router = useRouter();
  const [order, setOrder] = useState(initialOrder);
  const [status, setStatus] = useState(initialOrder.status);
  const [paymentStatus, setPaymentStatus] = useState(initialOrder.payment_status);
  const [isUpdating, setIsUpdating] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleUpdateStatus = async () => {
    // Confirmation before cancelling an order
    if (status === 'cancelled' && order.status !== 'cancelled') {
      const confirmed = window.confirm(
        `Are you sure you want to cancel order ${order.order_number}? This will mark the order as cancelled and update customer visibility.`
      );
      if (!confirmed) return;
    }

    setIsUpdating(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, payment_status: paymentStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setOrder(data.order);
        setFeedback({ type: 'success', message: 'Order status successfully updated.' });
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Failed to update order.' });
      }
    } catch (err) {
      console.error('Error updating order:', err);
      setFeedback({ type: 'error', message: 'An unexpected error occurred.' });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.container}>
      <Link href="/admin/orders" className={styles.backLink}>
        <ArrowLeft size={16} aria-hidden="true" />
        <span>Back to Orders</span>
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{order.order_number}</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-secondary)' }}>
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
      </header>

      {/* Visual Order Lifecycle Progress Indicator */}
      <div className={styles.card} style={{ padding: '16px 24px' }}>
        <OrderStatusProgress status={order.status} />
      </div>

      {feedback && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            backgroundColor: feedback.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: feedback.type === 'success' ? '#15803d' : '#b91c1c',
          }}
          role="status"
        >
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className={styles.grid}>
        {/* Left Column: Items & Customer Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Items Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              Ordered Items ({order.order_items?.length || 0})
            </h2>

            <div className={styles.itemsList}>
              {order.order_items?.map((item) => (
                <div key={item.id} className={styles.itemRow}>
                  <div className={styles.thumbnail}>
                    <ExternalImage
                      src={item.image_url}
                      alt={item.product_name}
                      fill
                      sizes="48px"
                      style={{ objectFit: 'contain' }}
                      fallbackIcon={<Smartphone size={20} color="#94a3b8" aria-hidden="true" />}
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    {item.brand && <span className={styles.itemBrand}>{item.brand}</span>}
                    <div className={styles.itemName}>{item.product_name}</div>
                    <div className={styles.itemMeta}>
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </div>
                  </div>

                  <div className={styles.itemPrice}>
                    {formatCurrency(item.total_price)}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: '#15803d', fontWeight: 'bold' }}>FREE</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total Amount</span>
              <span>{formatCurrency(order.total_amount)}</span>
            </div>
          </div>

          {/* Customer & Delivery Address Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Delivery Information</h2>

            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Recipient Name</span>
                <span className={styles.detailValue}>{order.customer_name}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Contact Email</span>
                <span className={styles.detailValue}>{order.customer_email}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Contact Phone</span>
                <span className={styles.detailValue}>{order.customer_phone}</span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Shipping Address</span>
                <span className={styles.detailValue}>
                  {order.address_line1}
                  {order.address_line2 ? `, ${order.address_line2}` : ''}
                  <br />
                  {order.city}, {order.state} - {order.pincode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Controls & Gateway Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Order Status Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Order Management</h2>

            <div className={styles.statusField}>
              <label htmlFor="order-status" className={styles.statusLabel}>
                Order Fulfillment Status
              </label>
              <select
                id="order-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className={styles.statusField}>
              <label htmlFor="payment-status" className={styles.statusLabel}>
                Payment Status
              </label>
              <select
                id="payment-status"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={styles.select}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isUpdating || (status === order.status && paymentStatus === order.payment_status)}
              className={styles.updateBtn}
              style={{ width: '100%' }}
            >
              {isUpdating ? 'Saving Changes...' : 'Update Status'}
            </button>
          </div>

          {/* Gateway Information Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="var(--color-accent)" />
              <span>Razorpay Transaction</span>
            </h2>

            <div className={styles.detailGrid} style={{ gridTemplateColumns: '1fr' }}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Razorpay Order ID</span>
                <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                  {order.razorpay_order_id || 'Not generated / Direct'}
                </span>
              </div>

              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Razorpay Payment ID</span>
                <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: order.razorpay_payment_id ? '#15803d' : 'inherit' }}>
                  {order.razorpay_payment_id || 'Awaiting payment verification'}
                </span>
              </div>

              {order.payment_verified_at && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Verified At</span>
                  <span className={styles.detailValue} style={{ fontSize: '0.8125rem' }}>
                    {formatDate(order.payment_verified_at)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
