import Link from 'next/link';
import {
  Smartphone,
  ShoppingBag,
  Clock,
  CheckCircle2,
  MessageSquare,
  TrendingUp,
  Users,
  Star,
  Plus,
  ArrowRight,
  Truck,
  Package,
  XCircle,
} from 'lucide-react';
import { getAdminOverviewStats } from '@/lib/services/admin';
import AutoHorizontalScroll from '@/components/common/AutoHorizontalScroll';
import styles from './admin.module.css';

export const dynamic = 'force-dynamic';

/**
 * Formats numeric price into INR currency string.
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

/**
 * Formats ISO date string to human-readable date.
 * @param {string} isoString
 * @returns {string}
 */
function formatDate(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getOrderStatusClass(status) {
  switch (status) {
    case 'delivered':
      return styles.statusDelivered;
    case 'shipped':
      return styles.statusShipped;
    case 'processing':
      return styles.statusProcessing;
    case 'confirmed':
      return styles.statusConfirmed;
    case 'cancelled':
      return styles.statusCancelled;
    case 'pending':
    default:
      return styles.statusPending;
  }
}

function getInquiryStatusClass(status) {
  switch (status) {
    case 'resolved':
      return styles.statusResolved;
    case 'read':
      return styles.statusRead;
    case 'new':
    default:
      return styles.statusNew;
  }
}

export default async function AdminDashboardPage() {
  const stats = await getAdminOverviewStats();

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.eyebrow}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>Admin Control Center</span>
          </div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            Show revenue, customers, orders, inventory and recent store activity.
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className={styles.actionRow}>
          <Link
            href="/admin/mobiles/new"
            className={styles.actionButtonPrimary}
          >
            <Plus size={15} aria-hidden="true" />
            <span>Add Mobile</span>
          </Link>

          <Link
            href="/admin/mobiles"
            className={styles.actionButton}
          >
            <Smartphone size={15} aria-hidden="true" />
            <span>Manage Mobiles</span>
          </Link>

          <Link
            href="/admin/orders"
            className={styles.actionButton}
          >
            <ShoppingBag size={15} aria-hidden="true" />
            <span>View Orders</span>
          </Link>

          <Link
            href="/admin/customers"
            className={styles.actionButton}
          >
            <Users size={15} aria-hidden="true" />
            <span>Manage Customers</span>
          </Link>

          <Link
            href="/admin/reviews"
            className={styles.actionButton}
          >
            <Star size={15} aria-hidden="true" />
            <span>Manage Reviews</span>
          </Link>

          <Link
            href="/admin/inquiries"
            className={styles.actionButton}
          >
            <MessageSquare size={15} aria-hidden="true" />
            <span>View Inquiries</span>
          </Link>
        </div>
      </header>

      {/* Stats Cards Grid */}
      <section className={styles.statsGrid} aria-label="Key Performance Indicators">
        {/* Total Revenue */}
        <div className={`${styles.statCard} ${styles.revenueStat}`}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Store Revenue</span>
            <div className={styles.statIconWrapper}>
              <TrendingUp size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>
            {formatCurrency(stats.totalRevenue)}
          </span>
        </div>

        {/* Total Customers */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Customers</span>
            <div className={styles.statIconWrapper}>
              <Users size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.totalCustomers}</span>
        </div>

        {/* Customer Reviews */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Customer Reviews</span>
            <div className={styles.statIconWrapper}>
              <Star size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.totalReviews}</span>
        </div>

        {/* Total Mobiles */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Products</span>
            <div className={styles.statIconWrapper}>
              <Smartphone size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.totalMobiles}</span>
        </div>

        {/* Featured Products */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Featured Mobiles</span>
            <div className={styles.statIconWrapper}>
              <Smartphone size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.featuredMobiles}</span>
        </div>

        {/* Total Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Total Orders</span>
            <div className={styles.statIconWrapper}>
              <ShoppingBag size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.totalOrders}</span>
        </div>

        {/* Pending Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Pending Orders</span>
            <div className={styles.statIconWrapper}>
              <Clock size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.pendingOrders}</span>
        </div>

        {/* Confirmed Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Confirmed</span>
            <div className={styles.statIconWrapper}>
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.confirmedOrders}</span>
        </div>

        {/* Processing Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Processing</span>
            <div className={styles.statIconWrapper}>
              <Package size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.processingOrders}</span>
        </div>

        {/* Shipped Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Shipped</span>
            <div className={styles.statIconWrapper}>
              <Truck size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.shippedOrders}</span>
        </div>

        {/* Delivered Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Delivered</span>
            <div className={styles.statIconWrapper}>
              <CheckCircle2 size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.deliveredOrders}</span>
        </div>

        {/* Cancelled Orders */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>Cancelled</span>
            <div className={styles.statIconWrapper}>
              <XCircle size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.cancelledOrders}</span>
        </div>

        {/* New Inquiries */}
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <span className={styles.statLabel}>New Inquiries</span>
            <div className={styles.statIconWrapper}>
              <MessageSquare size={18} aria-hidden="true" />
            </div>
          </div>
          <span className={styles.statValue}>{stats.newInquiries}</span>
        </div>
      </section>

      {/* Two Column Activity Grid */}
      <div className={styles.activityGrid}>
        {/* Recent Orders */}
        <section className={styles.activityCard} aria-labelledby="recent-orders-heading">
          <div className={styles.activityHeader}>
            <h2 id="recent-orders-heading" className={styles.activityTitle}>
              Recent Orders
            </h2>
            <Link href="/admin/orders" className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.tableCard}>
            <AutoHorizontalScroll className={styles.tableContainer}>
              {stats.recentOrders.length > 0 ? (
                <table className={`${styles.table} ${styles.ordersTable}`}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Order #</th>
                      <th className={styles.th}>Customer</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Total</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Date</th>
                      <th className={`${styles.th} ${styles.actionHeader}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className={styles.tr}>
                        <td className={styles.td}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-foreground)' }}
                          >
                            {order.order_number}
                          </Link>
                        </td>
                        <td className={styles.td}>{order.customer_name}</td>
                        <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {order.customer_email}
                        </td>
                        <td className={styles.td} style={{ fontWeight: 'var(--font-weight-semibold)' }}>
                          {formatCurrency(order.total_amount)}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusPill} ${getOrderStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {formatDate(order.created_at)}
                        </td>
                        <td className={`${styles.td} ${styles.actionCell}`}>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className={styles.viewButton}
                            aria-label={`View order ${order.order_number}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyText}>No orders received yet.</div>
              )}
            </AutoHorizontalScroll>
          </div>
        </section>

        {/* Recent Inquiries */}
        <section className={`${styles.activityCard} ${styles.inquiriesPanel}`} aria-labelledby="recent-inquiries-heading">
          <div className={styles.activityHeader}>
            <h2 id="recent-inquiries-heading" className={styles.activityTitle}>
              Recent Inquiries
            </h2>
            <Link href="/admin/inquiries" className={styles.viewAllLink}>
              <span>View All</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.tableCard}>
            <AutoHorizontalScroll className={styles.tableContainer}>
              {stats.recentInquiries.length > 0 ? (
                <table className={`${styles.table} ${styles.inquiriesTable}`}>
                  <thead>
                    <tr>
                      <th className={styles.th}>Customer</th>
                      <th className={styles.th}>Subject</th>
                      <th className={styles.th}>Email</th>
                      <th className={styles.th}>Status</th>
                      <th className={styles.th}>Date</th>
                      <th className={`${styles.th} ${styles.actionHeader}`}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentInquiries.map((inq) => (
                      <tr key={inq.id} className={styles.tr}>
                        <td className={`${styles.td} ${styles.inquiryContent}`}>
                          <Link
                            href={`/admin/inquiries/${inq.id}`}
                            style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-foreground)' }}
                          >
                            {inq.name}
                          </Link>
                        </td>
                        <td className={`${styles.td} ${styles.inquiryContent}`} style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inq.subject}
                        </td>
                        <td className={`${styles.td} ${styles.inquiryContent}`} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {inq.email}
                        </td>
                        <td className={styles.td}>
                          <span className={`${styles.statusPill} ${getInquiryStatusClass(inq.status)}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className={styles.td} style={{ fontSize: '0.8125rem', color: 'var(--color-secondary)' }}>
                          {formatDate(inq.created_at)}
                        </td>
                        <td className={`${styles.td} ${styles.actionCell}`}>
                          <Link
                            href={`/admin/inquiries/${inq.id}`}
                            className={styles.viewButton}
                            aria-label={`View inquiry from ${inq.name}`}
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={styles.emptyText}>No customer inquiries received yet.</div>
              )}
            </AutoHorizontalScroll>
          </div>
        </section>
      </div>
    </div>
  );
}
