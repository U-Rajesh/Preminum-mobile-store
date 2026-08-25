'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Star,
  ExternalLink,
} from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from '../customers.module.css';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderStatusClass(status) {
  switch (status) {
    case 'delivered':
      return { background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e' };
    case 'processing':
    case 'shipped':
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' };
    case 'cancelled':
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' };
    case 'pending':
    default:
      return { background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' };
  }
}

export default function AdminCustomerDetailPage() {
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomer() {
      if (!params?.id) return;
      try {
        const res = await fetch(`/api/admin/customers/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setCustomer(data.customer);
        }
      } catch (err) {
        console.error('Failed to load customer:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomer();
  }, [params?.id]);

  if (loading) {
    return <div style={{ padding: '40px', color: 'var(--color-secondary)' }}>Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div style={{ padding: '40px', color: 'var(--color-secondary)' }}>
        <p>Customer profile not found.</p>
        <Link href="/admin/customers" className="btn btn-outline" style={{ marginTop: '16px' }}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Back to Customers
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link
            href="/admin/customers"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-secondary)',
              fontSize: '0.875rem',
              marginBottom: '8px',
            }}
          >
            <ArrowLeft size={14} /> Back to Customer List
          </Link>
          <h1 className={styles.title}>{customer.full_name || 'Customer Account'}</h1>
          <p className={styles.subtitle}>Registered customer profile and purchase history.</p>
        </div>
      </header>

      {/* Customer Info Card & Key Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '16px' }}>
            Account Details
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-foreground)' }}>
              <User size={16} style={{ color: 'var(--color-secondary)' }} />
              <strong>{customer.full_name}</strong>
            </div>
            {customer.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
                <Mail size={16} />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
                <Phone size={16} />
                <span>{customer.phone}</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
              <Calendar size={16} />
              <span>Joined: {formatDate(customer.created_at)}</span>
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '16px' }}>
            Purchase Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Total Orders</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: '4px' }}>
                {customer.total_orders}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', textTransform: 'uppercase' }}>Total Spent</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-foreground)', marginTop: '4px' }}>
                {formatCurrency(customer.total_spent)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <section style={{ marginTop: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '12px' }}>
          Order History ({customer.orders?.length || 0})
        </h2>
        <div className={styles.tableCard}>
          <AutoHorizontalScroll className={styles.tableContainer}>
            {customer.orders?.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Order #</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Total</th>
                    <th className={styles.th} style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.orders.map((o) => {
                    const statusStyle = getOrderStatusClass(o.status);
                    return (
                      <tr key={o.id} className={styles.tr}>
                        <td className={styles.td} style={{ fontWeight: 600 }}>{o.order_number}</td>
                        <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {formatDate(o.created_at)}
                        </td>
                        <td className={styles.td}>
                          <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, ...statusStyle }}>
                            {o.status}
                          </span>
                        </td>
                        <td className={styles.td} style={{ fontWeight: 600 }}>
                          {formatCurrency(o.total_amount)}
                        </td>
                        <td className={styles.td} style={{ textAlign: 'right' }}>
                          <Link
                            href={`/admin/orders/${o.id}`}
                            className="btn btn-outline"
                            style={{ height: '28px', padding: '0 8px', fontSize: '0.75rem' }}
                          >
                            View Order
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>No orders placed by this customer yet.</div>
            )}
          </AutoHorizontalScroll>
        </div>
      </section>

      {/* Reviews Section */}
      <section style={{ marginTop: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-foreground)', marginBottom: '12px' }}>
          Customer Reviews ({customer.reviews?.length || 0})
        </h2>
        <div className={styles.tableCard}>
          <AutoHorizontalScroll className={styles.tableContainer}>
            {customer.reviews?.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>Product</th>
                    <th className={styles.th}>Rating</th>
                    <th className={styles.th}>Review</th>
                    <th className={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {customer.reviews.map((r) => (
                    <tr key={r.id} className={styles.tr}>
                      <td className={styles.td} style={{ fontWeight: 600 }}>
                        {r.mobiles ? `${r.mobiles.brand} ${r.mobiles.name}` : 'General Store Review'}
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: 'flex', gap: '2px', color: '#eab308' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < r.rating ? '#eab308' : 'none'}
                              color="#eab308"
                            />
                          ))}
                        </div>
                      </td>
                      <td className={styles.td} style={{ maxWidth: '300px' }}>
                        {r.title && <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{r.title}</div>}
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>{r.review_text}</div>
                      </td>
                      <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                        {formatDate(r.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>No reviews submitted by this customer yet.</div>
            )}
          </AutoHorizontalScroll>
        </div>
      </section>
    </div>
  );
}
