'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './OrdersTable.module.css';

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
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'confirmed':
      return styles.statusConfirmed;
    case 'processing':
      return styles.statusProcessing;
    case 'shipped':
      return styles.statusShipped;
    case 'delivered':
      return styles.statusDelivered;
    case 'cancelled':
      return styles.statusCancelled;
    case 'pending':
    default:
      return styles.statusPending;
  }
}

function getPaymentBadgeClass(status) {
  switch (status) {
    case 'paid':
      return styles.paymentPaid;
    case 'failed':
    case 'refunded':
      return styles.paymentFailed;
    case 'pending':
    default:
      return styles.paymentPending;
  }
}

export default function OrdersTable({ initialOrders = [] }) {
  const [orders] = useState(initialOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredOrders = orders
    .filter((o) => {
      const term = search.toLowerCase().trim();
      const matchSearch =
        !term ||
        o.order_number?.toLowerCase().includes(term) ||
        o.customer_name?.toLowerCase().includes(term) ||
        o.customer_email?.toLowerCase().includes(term) ||
        o.customer_phone?.toLowerCase().includes(term);

      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;

      return matchSearch && matchStatus && matchPayment;
    })
    .sort((a, b) => {
      if (sortBy === 'oldest') {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      if (sortBy === 'amount-high-low') {
        return Number(b.total_amount) - Number(a.total_amount);
      }
      if (sortBy === 'amount-low-high') {
        return Number(a.total_amount) - Number(b.total_amount);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <div className={styles.container}>
      {/* Filter / Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, name, email, or phone..."
            className={styles.searchInput}
            aria-label="Search orders"
          />
        </div>

        <div className={styles.selectGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by order status"
          >
            <option value="all">All Order Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={styles.select}
            aria-label="Filter by payment status"
          >
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.select}
            aria-label="Sort orders"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount-high-low">Amount: High to Low</option>
            <option value="amount-low-high">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className={styles.tableCard}>
        <AutoHorizontalScroll className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Order #</th>
                <th className={styles.th}>Customer</th>
                <th className={styles.th}>Items</th>
                <th className={styles.th}>Total</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Payment</th>
                <th className={styles.th}>Date</th>
                <th className={`${styles.th} ${styles.actionHeader}`}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className={styles.tr}>
                    <td className={styles.td}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-foreground)' }}
                      >
                        {order.order_number}
                      </Link>
                    </td>

                    <td className={styles.td}>
                      <div style={{ fontWeight: 'var(--font-weight-medium)' }}>{order.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-secondary)' }}>
                        {order.customer_email} · {order.customer_phone}
                      </div>
                    </td>

                    <td className={styles.td}>
                      {order.order_items?.length || 1} {order.order_items?.length === 1 ? 'item' : 'items'}
                    </td>

                    <td className={styles.td}>
                      <span style={{ fontWeight: 'var(--font-weight-bold)' }}>
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.badge} ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    <td className={styles.td}>
                      <span className={`${styles.badge} ${getPaymentBadgeClass(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>

                    <td className={styles.td}>{formatDate(order.created_at)}</td>

                    <td className={`${styles.td} ${styles.actionCell}`}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className={styles.viewButton}
                        aria-label={`View order ${order.order_number}`}
                      >
                        <Eye size={15} aria-hidden="true" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--color-muted)' }}>
                    {orders.length === 0
                      ? 'No customer orders have been placed yet.'
                      : 'No orders found matching your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AutoHorizontalScroll>
      </div>
    </div>
  );
}
